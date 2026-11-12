/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { storage } from './src/server/storage.ts';
import { centralBrain } from './src/server/centralBrain.ts';
import { MandatoryTestRunner } from './src/server/testRunner.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parser with 50MB limit to handle base64 documents, audio, and images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- API Routes ---

  // Auth & PIN
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ success: false, message: 'رمز الدخول مطلوب' });
    }
    const result = storage.verifyPin(pin);
    if (result.success) {
      return res.json({
        success: true,
        token: result.token,
        isDefaultPin: result.isDefaultPin,
        message: result.isDefaultPin
          ? 'تم الدخول بالرمز الأولي (000000). يُرجى تغيير الرمز فوراً لضمان سرية مكتب المحاماة.'
          : 'تم تسجيل الدخول بنجاح',
      });
    }
    return res.status(401).json({ success: false, message: 'رمز الدخول غير صحيح' });
  });

  app.post('/api/auth/change-pin', (req: Request, res: Response) => {
    const { oldPin, newPin } = req.body;
    if (!oldPin || !newPin) {
      return res.status(400).json({ success: false, message: 'الرمز الحالي والرمز الجديد مطلوبان' });
    }
    const result = storage.changePin(oldPin, newPin);
    if (result.success) {
      return res.json(result);
    }
    return res.status(400).json(result);
  });

  // Chat & Central Brain
  app.get('/api/chat/conversations', (_req: Request, res: Response) => {
    res.json(storage.getConversations());
  });

  app.post('/api/chat/conversations', (req: Request, res: Response) => {
    const { title, category, caseId } = req.body;
    const conv = storage.createConversation(title, category, caseId);
    res.json(conv);
  });

  app.delete('/api/chat/conversations/:id', (req: Request, res: Response) => {
    const success = storage.deleteConversation(req.params.id);
    res.json({ success });
  });

  app.get('/api/chat/messages/:conversationId', (req: Request, res: Response) => {
    res.json(storage.getMessages(req.params.conversationId));
  });

  app.post('/api/chat/message', async (req: Request, res: Response) => {
    try {
      const { conversationId, content, engineMode = 'AUTOMATIC', attachments = [], audioBase64, caseId } = req.body;

      if (!conversationId || (!content && !audioBase64 && attachments.length === 0)) {
        return res.status(400).json({ error: 'محتوى الرسالة أو المرفقات مطلوبة' });
      }

      // Record user message
      const userMsg = storage.addMessage({
        conversationId,
        sender: 'user',
        content: content || (audioBase64 ? '🎤 [تسجيل صوتي مرفق]' : '📎 [مرفق مستند أو صورة]'),
        engineUsed: engineMode,
        attachments,
        caseId,
      });

      // Process through 16-head central brain
      const brainOutput = await centralBrain.processRequest({
        userInput: content || '',
        conversationId,
        engineMode,
        attachments,
        audioBase64,
        caseId,
      });

      // Record assistant message
      const assistantMsg = storage.addMessage({
        conversationId,
        sender: 'assistant',
        content: brainOutput.responseContent,
        engineUsed: brainOutput.engineUsed,
        activePersona: brainOutput.activePersona,
        intentSummary: brainOutput.intentSummary,
        legalTags: brainOutput.legalTags,
        isVerified: brainOutput.isVerified,
        caseId,
      });

      res.json({
        userMessage: userMsg,
        assistantMessage: assistantMsg,
      });
    } catch (err: any) {
      console.error('Error processing chat message:', err);
      res.status(500).json({ error: 'حدث خطأ أثناء معالجة الرسالة: ' + err.message });
    }
  });

  // Office Management (15 Entities)
  app.get('/api/office/stats', (_req: Request, res: Response) => {
    const cases = storage.getCases();
    const clients = storage.getClients();
    const sessions = storage.getSessions();
    const tasks = storage.getTasks();
    const financials = storage.getFinancials();

    const activeCases = cases.filter((c) => c.status === 'قيد التداول').length;
    const upcomingSessions = sessions.filter((s) => s.status === 'قادمة').length;
    const pendingTasks = tasks.filter((t) => t.status !== 'مكتمل').length;
    const totalCollected = financials
      .filter((f) => f.type === 'أتعاب مقبوضة')
      .reduce((sum, f) => sum + f.amount, 0);

    res.json({
      totalCases: cases.length,
      activeCases,
      totalClients: clients.length,
      upcomingSessions,
      pendingTasks,
      totalCollected,
    });
  });

  app.get('/api/office/clients', (_req: Request, res: Response) => res.json(storage.getClients()));
  app.post('/api/office/clients', (req: Request, res: Response) => res.json(storage.addClient(req.body)));

  app.get('/api/office/cases', (_req: Request, res: Response) => res.json(storage.getCases()));
  app.post('/api/office/cases', (req: Request, res: Response) => res.json(storage.addCase(req.body)));

  app.get('/api/office/sessions', (_req: Request, res: Response) => res.json(storage.getSessions()));
  app.post('/api/office/sessions', (req: Request, res: Response) => res.json(storage.addSession(req.body)));

  app.get('/api/office/tasks', (_req: Request, res: Response) => res.json(storage.getTasks()));
  app.post('/api/office/tasks', (req: Request, res: Response) => res.json(storage.addTask(req.body)));
  app.patch('/api/office/tasks/:id', (req: Request, res: Response) => {
    storage.updateTaskStatus(req.params.id, req.body.status);
    res.json({ success: true });
  });

  app.get('/api/office/financials', (_req: Request, res: Response) => res.json(storage.getFinancials()));
  app.post('/api/office/financials', (req: Request, res: Response) => res.json(storage.addFinancial(req.body)));

  app.get('/api/office/documents', (_req: Request, res: Response) => res.json(storage.getDocuments()));
  app.post('/api/office/documents', (req: Request, res: Response) => res.json(storage.addDocument(req.body)));

  // Subscriptions (500 EGP / 01153747612)
  app.get('/api/subscriptions', (_req: Request, res: Response) => res.json(storage.getSubscriptions()));
  app.post('/api/subscriptions', (req: Request, res: Response) => {
    const { payerName, phone, amount = 500, referenceNumber, transferDate, receiptImageBase64 } = req.body;
    if (!payerName || !phone || !referenceNumber) {
      return res.status(400).json({ error: 'اسم المحول، رقم الهاتف، والرقم المرجعي حقول مطلوبة' });
    }
    const newSub = storage.addSubscription({
      payerName,
      phone,
      amount: Number(amount),
      referenceNumber,
      transferDate: transferDate || new Date().toISOString().split('T')[0],
      receiptImageBase64,
    });
    res.json(newSub);
  });

  app.patch('/api/subscriptions/:id/status', (req: Request, res: Response) => {
    const { status, notes } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'الحالة يجب أن تكون إما APPROVED أو REJECTED' });
    }
    const updated = storage.updateSubscriptionStatus(req.params.id, status, notes);
    if (!updated) return res.status(404).json({ error: 'الاشتراك غير موجود' });
    res.json(updated);
  });

  // Gemini API Key Management (Server-side Only)
  app.get('/api/gemini/config', (_req: Request, res: Response) => {
    res.json(storage.getGeminiStatus());
  });

  app.post('/api/gemini/config', async (req: Request, res: Response) => {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: 'مفتاح API مطلوب' });
    }
    storage.setCustomGeminiKey(apiKey);

    // Test the key server-side
    try {
      const testBrain = await centralBrain.processRequest({
        userInput: 'فحص الاتصال بمحرك Gemini',
        conversationId: 'test-check',
        engineMode: 'GEMINI',
      });
      storage.recordGeminiUsage(1, true);
      res.json({
        success: true,
        message: 'تم التحقق من مفتاح Gemini بنجاح وتأمين حفظه على الخادم',
        status: storage.getGeminiStatus(),
      });
    } catch (e: any) {
      storage.recordGeminiUsage(0, false, e.message);
      res.status(400).json({
        success: false,
        message: 'فشل اختبار المفتاح: ' + e.message,
        status: storage.getGeminiStatus(),
      });
    }
  });

  // Egyptian Legal Dictionary
  app.get('/api/dictionary', (req: Request, res: Response) => {
    const query = req.query.q as string;
    res.json(storage.getDictionary(query));
  });

  // 30 Mandatory Engineering Tests Runner
  app.get('/api/tests/run-all', async (_req: Request, res: Response) => {
    try {
      const results = await MandatoryTestRunner.runAllTests();
      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: 'فشل تنفيذ الاختبارات: ' + e.message });
    }
  });

  // Setup Vite in Development mode
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[المستشار عطية الهلباوي] الخادم يعمل بنجاح على المنفذ: http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Error:', err);
});
