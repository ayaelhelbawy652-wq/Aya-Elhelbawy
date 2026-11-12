/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  FileText,
  Copy,
  Printer,
  FileDown,
  Share2,
  BookmarkPlus,
  Trash2,
  Plus,
  Search,
  Scale,
  Check,
  ShieldCheck,
  Image as ImageIcon,
  StopCircle,
  Menu,
  X,
  Sparkles,
  Scroll,
  MessageCircle,
  Compass,
} from 'lucide-react';
import { ChatMessage, Conversation, EngineMode, Attachment, LegalCase } from '../types/index.ts';
import { DocumentExporter } from '../utils/exporter.ts';
import { LanguageContextUnit, IntentDetectionUnit, DispatchResult } from '../services/brainUnits.ts';

interface ChatRoomProps {
  cases: LegalCase[];
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ cases }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [engineMode, setEngineMode] = useState<EngineMode>('AUTOMATIC');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [saveToCaseModalMsg, setSaveToCaseModalMsg] = useState<ChatMessage | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ربط العقل المركزي ومكونات فهم السياق وتحديد النية
  const contextAnalyzer = useRef(new LanguageContextUnit()).current;
  const intentDetector = useRef(new IntentDetectionUnit(contextAnalyzer)).current;

  // التحليل الفوري للمدخلات الحالية عبر وحدة فهم اللغة والسياق وتحديد النية (Live Context Understanding)
  const liveDispatch = useMemo<DispatchResult | null>(() => {
    if (!input.trim() && attachments.length === 0) return null;
    return intentDetector.dispatch(input, messages, attachments, selectedCaseId || undefined);
  }, [input, attachments, messages, selectedCaseId, intentDetector]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      setSidebarOpen(false); // Close mobile sidebar upon selection
    }
  }, [activeConvId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      const data: Conversation[] = await res.json();
      setConversations(data);
      if (data.length > 0 && !activeConvId) {
        setActiveConvId(data[0].id);
      }
    } catch (e) {
      console.error('Error fetching conversations', e);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/chat/messages/${convId}`);
      const data: ChatMessage[] = await res.json();
      setMessages(data);
    } catch (e) {
      console.error('Error fetching messages', e);
    }
  };

  const createNewConversation = async () => {
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'استشارة قانونية جديدة',
          category: 'legal',
        }),
      });
      const newConv: Conversation = await res.json();
      setConversations([newConv, ...conversations]);
      setActiveConvId(newConv.id);
      setMessages([]);
      setSidebarOpen(false);
    } catch (e) {
      console.error('Error creating conversation', e);
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف هذه المحادثة بالكامل؟')) return;
    try {
      await fetch(`/api/chat/conversations/${id}`, { method: 'DELETE' });
      const filtered = conversations.filter((c) => c.id !== id);
      setConversations(filtered);
      if (activeConvId === id) {
        setActiveConvId(filtered[0]?.id || '');
      }
    } catch (e) {
      console.error('Error deleting conversation', e);
    }
  };

  // Voice recording via Web Speech Recognition
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('المتصفح الحالي لا يدعم تفريغ الصوت المباشر عبر Web Speech API. يرجى استخدام متصفح Chrome أو كتابة النص يدوياً.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-EG'; // Egyptian Arabic
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInput((prev) => (prev ? prev.trim() + ' ' : '') + currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      alert('تعذر تشغيل المايكروفون: ' + e.message);
      setIsRecording(false);
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result as string;
        const newAttachment: Attachment = {
          id: 'att-' + Date.now() + '-' + i,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataBase64: base64,
          extractedText: file.type.startsWith('text/')
            ? atob(base64.split(',')[1] || '')
            : `مستند مرفق [${file.name}] جاهز للتحليل القانوني واستخراج البنود والأطراف.`,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };

      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || loading) return;

    let convId = activeConvId;
    if (!convId) {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: input.slice(0, 30) || 'استشارة بالمرفقات',
          category: 'legal',
        }),
      });
      const newConv = await res.json();
      convId = newConv.id;
      setConversations([newConv, ...conversations]);
      setActiveConvId(newConv.id);
    }

    const currentInput = input;
    const currentAttachments = [...attachments];

    // تمرير المدخلات عبر وحدة فهم اللغة والسياق ووحدة تحديد النية المركزية قبل الإرسال
    const dispatchInfo = intentDetector.dispatch(
      currentInput,
      messages,
      currentAttachments,
      selectedCaseId || undefined
    );

    const displayEngine: ChatMessage['engineUsed'] =
      engineMode === 'ATTYA_LEGAL_MIND'
        ? 'ATTYA LEGAL MIND'
        : engineMode === 'GEMINI'
        ? 'GEMINI 3.8 FLASH'
        : dispatchInfo.engine;

    // Optimistic temporary user message tagged with analyzed context and persona
    const tempUserMsg: ChatMessage = {
      id: 'temp-' + Date.now(),
      conversationId: convId,
      sender: 'user',
      content: currentInput || (currentAttachments.length > 0 ? '📎 [مرفق مستند أو صورة]' : ''),
      engineUsed: displayEngine,
      activePersona: dispatchInfo.persona,
      intentSummary: `${dispatchInfo.classificationKey} (${dispatchInfo.reasoning})`,
      timestamp: Date.now(),
      attachments: currentAttachments,
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setAttachments([]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: convId,
          content: currentInput,
          engineMode,
          attachments: currentAttachments,
          caseId: selectedCaseId || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.userMessage && data.assistantMessage) {
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          data.userMessage,
          data.assistantMessage,
        ]);
      } else {
        throw new Error(data.error || 'فشل استلام الرد من الخادم');
      }
    } catch (err: any) {
      console.error('Error sending message', err);
      // Append friendly error card
      const errorAssistantMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        conversationId: convId,
        sender: 'assistant',
        content: `عذراً، حدث تعذر مؤقت في الاتصال بالعقل المركزي: ${err.message}. يرجى المحاولة مرة أخرى.`,
        engineUsed: displayEngine,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorAssistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    DocumentExporter.copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveToCase = async (msg: ChatMessage, caseId: string) => {
    if (!caseId) return;
    try {
      await fetch('/api/office/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          title: `استشارة قانونية محفوظة (${new Date().toLocaleDateString('ar-EG')})`,
          type: 'مذكرة دفاع',
          content: msg.content,
          parties: [{ name: 'المستشار عطية الهلباوي', role: 'محامٍ ومستشار' }],
          status: 'مسودة',
        }),
      });
      alert('تم حفظ الإجابة بنجاح في ملف القضية المحددة!');
      setSaveToCaseModalMsg(null);
    } catch (e: any) {
      alert('فشل حفظ المستند: ' + e.message);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Enhanced Markdown formatter for clean legal rendering without raw symbols
   */
  const renderFormattedMessage = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-2 text-sm leading-relaxed font-sans text-slate-100">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }

          // Heading 3: ### Title
          if (trimmed.startsWith('### ')) {
            return (
              <h3
                key={idx}
                className="text-base font-bold text-amber-200 mt-3 mb-1.5 pb-1 border-b border-amber-500/20 font-['Cairo',sans-serif] flex items-center gap-1.5"
              >
                {trimmed.replace(/^###\s*/, '')}
              </h3>
            );
          }

          // Heading 2: ## Title
          if (trimmed.startsWith('## ')) {
            return (
              <h2
                key={idx}
                className="text-lg font-bold text-amber-100 mt-4 mb-2 pb-1 border-b border-amber-500/30 font-['Cairo',sans-serif]"
              >
                {trimmed.replace(/^##\s*/, '')}
              </h2>
            );
          }

          // Quote: > Note
          if (trimmed.startsWith('> ')) {
            return (
              <div
                key={idx}
                className="bg-[#060d19] border-r-2 border-amber-400 p-2.5 rounded-l-lg text-xs text-amber-100/90 my-2 leading-relaxed"
              >
                {trimmed.replace(/^>\s*/, '')}
              </div>
            );
          }

          // Divider: ---
          if (trimmed === '---') {
            return <hr key={idx} className="border-amber-500/20 my-3" />;
          }

          // Bullet item: - or *
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const itemText = trimmed.replace(/^[-*]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 mr-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span className="text-slate-200">{formatInlineText(itemText)}</span>
              </div>
            );
          }

          // Numbered item: 1. 2.
          const numberedMatch = trimmed.match(/^(\d+\.)\s+(.+)$/);
          if (numberedMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 mr-2">
                <span className="font-mono font-bold text-amber-400 text-xs mt-0.5 shrink-0">
                  {numberedMatch[1]}
                </span>
                <span className="text-slate-200">{formatInlineText(numberedMatch[2])}</span>
              </div>
            );
          }

          // Default paragraph
          return (
            <p key={idx} className="text-slate-200">
              {formatInlineText(line)}
            </p>
          );
        })}
      </div>
    );
  };

  /**
   * Format **bold** and *italic* within lines
   */
  const formatInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-amber-200">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#070d18] text-slate-100 overflow-hidden relative">
      {/* Sidebar: Conversations List (Collapsible on mobile) */}
      <aside
        className={`fixed inset-y-0 right-0 z-30 w-72 sm:w-80 border-l border-amber-500/20 bg-[#091220] flex flex-col shrink-0 transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3.5 border-b border-amber-500/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-200">سجل المحادثات القضائية</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={createNewConversation}
            className="w-full py-2 px-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer shadow-sm shadow-amber-500/10 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>محادثة جديدة</span>
          </button>

          <div className="relative">
            <input
              type="text"
              placeholder="بحث في المحادثات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#060a12] border border-amber-500/20 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              لا توجد محادثات سابقة
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors text-right ${
                  activeConvId === conv.id
                    ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200 shadow-sm'
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="truncate flex-1 pl-2">
                  <div className="text-xs font-semibold truncate">{conv.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(conv.updatedAt).toLocaleDateString('ar-EG')} · {conv.messageCount || 0} رسالة
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  title="حذف المحادثة"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-[#070d18] overflow-hidden min-w-0">
        {/* Chat Top Bar */}
        <div className="h-14 border-b border-amber-500/20 bg-[#091220]/90 px-3 sm:px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg bg-slate-800 text-amber-300 hover:bg-slate-700"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600/30 to-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Scale className="w-4 h-4" />
            </div>

            <div className="truncate">
              <h1 className="text-xs sm:text-sm font-bold text-amber-100 truncate font-['Cairo',sans-serif]">
                غرفة محادثة المستشار عطية الهلباوي
              </h1>
              <p className="text-[10px] text-amber-400/80 truncate hidden sm:block">
                عقل مركزي ذو 16 وحدة · توجيه ذكي بين المحاور العام والمستشار القانوني المصري
              </p>
            </div>
          </div>

          {/* Engine Selector Segmented Control */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-slate-400 hidden lg:inline">المحرك:</span>
            <div className="flex items-center bg-[#060a12] border border-amber-500/30 rounded-lg p-0.5 text-[11px]">
              <button
                onClick={() => setEngineMode('AUTOMATIC')}
                className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  engineMode === 'AUTOMATIC'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                تلقائي
              </button>
              <button
                onClick={() => setEngineMode('ATTYA_LEGAL_MIND')}
                className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  engineMode === 'ATTYA_LEGAL_MIND'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ATTYA LEGAL MIND
              </button>
              <button
                onClick={() => setEngineMode('GEMINI')}
                className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  engineMode === 'GEMINI'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                GEMINI
              </button>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#aa820a] to-[#d4af37] p-0.5 mb-4 shadow-lg shadow-amber-500/10">
                <div className="w-full h-full rounded-2xl bg-[#091220] flex items-center justify-center">
                  <Scale className="w-8 h-8 text-amber-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-amber-100 mb-2 font-['Cairo',sans-serif]">
                مرحباً بك في رحاب المستشار عطية الهلباوي
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                المنصة الذكية الملكية. يوجه العقل المركزي استفساراتك بذكاء؛ فالحوار العام يُرد عليه بأسلوب ودي دون إقحام قانوني، بينما الاستشارات القضائية تُفحص وتُكيف وفقاً لأحكام القانون المصري ومحكمة النقض.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-right text-xs">
                <button
                  onClick={() => setInput('مساء الخير يا فندم، محتاج نصيحة لتنظيم وقتي في العمل')}
                  className="p-3 rounded-xl bg-[#091220] border border-amber-500/20 hover:border-amber-400 text-slate-200 transition-colors cursor-pointer text-right"
                >
                  💬 محادثة عامة وتنظيم أعمال
                </button>
                <button
                  onClick={() => setInput('ما هي الدفوع الجوهرية في جريمة تبديد إيصال أمانة؟')}
                  className="p-3 rounded-xl bg-[#091220] border border-amber-500/20 hover:border-amber-400 text-slate-200 transition-colors cursor-pointer text-right"
                >
                  ⚖️ استشارة قانونية (إيصال أمانة)
                </button>
                <button
                  onClick={() => setInput('صيغ لي عقد بيع ابتدائي لشقة سكنية متضمناً الشرط الفاسخ الصريح')}
                  className="p-3 rounded-xl bg-[#091220] border border-amber-500/20 hover:border-amber-400 text-slate-200 transition-colors cursor-pointer text-right"
                >
                  📜 صياغة عقد بيع ابتدائي
                </button>
                <button
                  onClick={() => setInput('ما هي إجراءات وشروط رفع دعوى خلع أمام محكمة الأسرة؟')}
                  className="p-3 rounded-xl bg-[#091220] border border-amber-500/20 hover:border-amber-400 text-slate-200 transition-colors cursor-pointer text-right"
                >
                  🏛️ دعوى الخلع بمحكمة الأسرة
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-3xl w-full sm:w-auto rounded-2xl p-4 sm:p-5 text-right transition-all shadow-md ${
                      isAssistant
                        ? 'bg-[#091220] border-2 border-royal-double border-amber-500/30 text-slate-100'
                        : 'bg-gradient-to-l from-amber-700/30 to-amber-600/20 border border-amber-500/40 text-amber-50'
                    }`}
                  >
                    {/* Header for assistant message */}
                    {isAssistant && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-amber-500/20 text-[11px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-amber-300 font-['Cairo',sans-serif]">
                            المستشار عطية الهلباوي
                          </span>

                          {/* Persona Badge */}
                          {msg.activePersona === 'المحاور العام' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 text-[10px]">
                              <MessageCircle className="w-3 h-3 text-emerald-400" />
                              <span>المحاور العام</span>
                            </span>
                          ) : msg.activePersona === 'مولد العقود والمذكرات' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-700/50 text-[10px]">
                              <Scroll className="w-3 h-3 text-purple-400" />
                              <span>صياغة عقود ومذكرات</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/50 text-[10px]">
                              <Scale className="w-3 h-3 text-amber-400" />
                              <span>المستشار القانوني المصري</span>
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded bg-black/40 border border-slate-700 text-slate-400 text-[10px] font-mono">
                            {msg.engineUsed || 'ATTYA LEGAL MIND'}
                          </span>

                          {msg.isVerified && (
                            <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                              <ShieldCheck className="w-3 h-3" />
                              <span>موثق</span>
                            </span>
                          )}
                        </div>

                        <span className="text-slate-400 text-[10px] font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}

                    {/* Attachments if any */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mb-3 space-y-1.5">
                        {msg.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-amber-500/20 text-xs text-amber-200"
                          >
                            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="truncate flex-1">{att.name}</span>
                            <span className="text-[10px] text-slate-400">
                              ({Math.round(att.size / 1024)} ك.ب)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formatted Message Body */}
                    {isAssistant ? (
                      renderFormattedMessage(msg.content)
                    ) : (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-amber-50">
                        {msg.content}
                      </div>
                    )}

                    {/* Legal Tags */}
                    {msg.legalTags && msg.legalTags.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5 text-[10px]">
                        {msg.legalTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded bg-[#060a12] text-amber-300/90 border border-amber-500/20"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Bar for Assistant Responses */}
                    {isAssistant && (
                      <div className="mt-3.5 pt-3 border-t border-amber-500/20 flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          title="نسخ الإجابة كاملة"
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#060a12] hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/80 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => DocumentExporter.printDocument(msg.content)}
                          title="طباعة مباشرة منسقة"
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#060a12] hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/80 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>طباعة</span>
                        </button>

                        <button
                          onClick={() => DocumentExporter.printDocument(msg.content)}
                          title="تنزيل PDF"
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#060a12] hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/80 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <FileDown className="w-3.5 h-3.5 text-red-400" />
                          <span>PDF</span>
                        </button>

                        <button
                          onClick={() => DocumentExporter.exportDocx(msg.content)}
                          title="تصدير Word"
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#060a12] hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/80 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <FileDown className="w-3.5 h-3.5 text-blue-400" />
                          <span>Word</span>
                        </button>

                        <button
                          onClick={() => DocumentExporter.exportTxt(msg.content)}
                          title="تصدير TXT"
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#060a12] hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/80 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>TXT</span>
                        </button>

                        <button
                          onClick={() => DocumentExporter.exportHtml(msg.content)}
                          title="تصدير HTML"
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#060a12] hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/80 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <FileDown className="w-3.5 h-3.5 text-amber-400" />
                          <span>HTML</span>
                        </button>

                        <button
                          onClick={() => DocumentExporter.shareContent('استشارة قانونية', msg.content)}
                          title="مشاركة من الجهاز"
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#060a12] hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/80 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>مشاركة</span>
                        </button>

                        <button
                          onClick={() => setSaveToCaseModalMsg(msg)}
                          title="حفظ في ملف القضية"
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>حفظ بالقضية</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex items-start">
              <div className="bg-[#091220] border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 text-amber-300 text-xs">
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                <span>العقل المركزي للمستشار عطية الهلباوي يقوم بفحص النية وتكييف الوقائع وتوليد الاستجابة...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Selected Attachments Preview */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 bg-[#091220] border-t border-amber-500/20 flex flex-wrap gap-2">
            {attachments.map((att, idx) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#060a12] border border-amber-500/40 text-xs text-amber-200"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate max-w-[150px]">{att.name}</span>
                <button
                  onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-red-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Multimodal Input & Media Bar */}
        <div className="p-3 sm:p-4 bg-[#091220] border-t border-amber-500/30 shrink-0">
          <form onSubmit={handleSendMessage} className="space-y-2">
            {/* Live Context Understanding & Dispatcher Preview Banner */}
            {liveDispatch && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#060a12]/95 border border-amber-500/30 text-[11px] mb-1.5 transition-all">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Compass className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>وحدة فهم السياق والنية:</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {liveDispatch.detectedDialect || 'فصحى معاصرة'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-medium flex items-center gap-1 ${
                      liveDispatch.category === 'legal'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        : 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                    }`}
                  >
                    {liveDispatch.category === 'legal' ? (
                      <>
                        <Scale className="w-3 h-3 text-amber-400" />
                        <span>مسار استشارة وقضاء مصري {liveDispatch.legalBranch ? `(${liveDispatch.legalBranch})` : ''}</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-3 h-3 text-blue-400" />
                        <span>مسار محاورة عامة وتطوير أعمال</span>
                      </>
                    )}
                  </span>
                  <span className="text-slate-300 hidden md:inline">
                    الشخصية الموجهة: <strong className="text-amber-300">{liveDispatch.persona}</strong>
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 hidden lg:block">
                  المحرك المقترح: <span className="text-amber-200">{liveDispatch.engine}</span> (ثقة {Math.round(liveDispatch.confidence * 100)}%)
                </div>
              </div>
            )}

            <div className="relative flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                placeholder="اكتب رسالتك العامة أو وقائع القضية أو استفسارك هنا، أو ارفع مستنداً/صورة، أو سجل صوتياً..."
                className="flex-1 bg-[#060a12] border border-amber-500/30 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 resize-none font-sans"
              />

              <button
                type="submit"
                disabled={(!input.trim() && attachments.length === 0) || loading}
                className="h-12 w-12 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold flex items-center justify-center hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 cursor-pointer shrink-0 shadow-md shadow-amber-500/20"
              >
                <Send className="w-5 h-5 -rotate-90" />
              </button>
            </div>

            {/* Media Bar Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Upload Documents (PDF, DOCX, TXT) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.csv"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                  <span>رفع مستند (PDF/Word)</span>
                </button>

                {/* Upload Image & OCR */}
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>صورة / محضر (OCR)</span>
                </button>

                {/* Voice Speech-to-Text */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    isRecording
                      ? 'bg-red-950/80 border-red-500 text-red-200 animate-pulse'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border-slate-700'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <StopCircle className="w-3.5 h-3.5 text-red-400" />
                      <span>جاري التسجيل والتفريغ... (اضغط للإيقاف)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تسجيل صوتي (ASR)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Case Linkage Selector */}
              {cases.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px] whitespace-nowrap">ربط بقضية:</span>
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    className="bg-[#060a12] border border-amber-500/30 rounded-lg px-2 py-1 text-xs text-amber-200 focus:outline-none"
                  >
                    <option value="">بدون ربط بقضية</option>
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.caseNumber}/{c.year} ({c.clientName})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Save to Case Modal */}
      {saveToCaseModalMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#091220] border-2 border-royal-double border-amber-500/40 rounded-2xl p-6 text-right">
            <h3 className="text-lg font-bold text-amber-200 mb-2">إيداع الاستشارة في ملف القضية</h3>
            <p className="text-xs text-slate-400 mb-4">اختر القضية المراد حفظ هذه المذكرة/الاستشارة في مستنداتها الرسمية:</p>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {cases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSaveToCase(saveToCaseModalMsg, c.id)}
                  className="p-3 rounded-xl bg-[#060a12] border border-amber-500/20 hover:border-amber-400 cursor-pointer transition-colors"
                >
                  <div className="text-xs font-bold text-amber-100">
                    قضية رقم {c.caseNumber} لسنة {c.year} ({c.court})
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    الموكل: {c.clientName} · الخصم: {c.opponentName}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSaveToCaseModalMsg(null)}
              className="w-full py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-xs cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
