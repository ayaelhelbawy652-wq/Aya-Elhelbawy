/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import {
  Client,
  Opponent,
  LegalCase,
  CourtSession,
  LegalDocument,
  OfficeTask,
  FinancialRecord,
  CashSubscription,
  LegalDictionaryEntry,
  Conversation,
  ChatMessage,
  TestResultItem,
  GeminiConfigStatus,
} from '../types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

interface AppDatabase {
  auth: {
    masterPin: string;
    isDefaultPin: boolean;
    sessions: Record<string, { role: string; expiresAt: number }>;
  };
  gemini: {
    customApiKey: string;
    totalTokensUsed: number;
    lastTestedAt?: number;
    lastTestStatus: 'SUCCESS' | 'FAILED' | 'UNTESTED';
    errorMessage?: string;
  };
  clients: Client[];
  opponents: Opponent[];
  cases: LegalCase[];
  sessions: CourtSession[];
  documents: LegalDocument[];
  tasks: OfficeTask[];
  financials: FinancialRecord[];
  subscriptions: CashSubscription[];
  conversations: Conversation[];
  messages: ChatMessage[];
  dictionary: LegalDictionaryEntry[];
  auditLogs: { timestamp: number; action: string; details: string }[];
}

// Initial seed Egyptian legal terms and definitions
const INITIAL_DICTIONARY: LegalDictionaryEntry[] = [
  {
    term: 'التكييف القانوني للدعوى',
    linguisticDefinition: 'تحديد كنه الشيء وإرجاعه إلى صنفه وأصله اللغوي.',
    legalDefinition: 'إسباغ الوصف القانوني السليم على الوقائع المعروضة على القضاء وإنزال حكم القانون عليها، وهو من صميم عمل قاضي الموضوع.',
    jurisprudenceNote: 'المحكمة غير مقيدة بأوصاف الخصوم وتكييفهم الخاطئ للطلبات (المادة 86 مرافعات).',
    statutoryBasis: 'قانون المرافعات المدنية والتجارية رقم 13 لسنة 1968',
    cassationPrinciple: 'الطعن رقم 1450 لسنة 54 ق - العبرة في تكييف الدعوى بحقيقة المطلوب فيها لا بالألفاظ التي صيغت بها.',
    practicalExample: 'تكييف دعوى استرداد حيازة بالرغم من إطلاق المدعي عليها لفظ دعوى تعويض.',
    category: 'مرافعات',
  },
  {
    term: 'الدفع بانتفاء الركن المادي للجريمة',
    linguisticDefinition: 'الدفع هو الرد والإبعاد، والركن هو الجانب الأقوى للشيء.',
    legalDefinition: 'دفع جوهري يقدمه الدفاع الجنائي ينفي به قيام السلوك الإجرامي أو النتيجة الضارة أو علاقة السببية بينهما.',
    jurisprudenceNote: 'يوجب على المحكمة إيراده والرد عليه بأسباب سائغة تؤدي إلى إطراحه إن رأت إدانة المتهم.',
    statutoryBasis: 'قانون الإجراءات الجنائية وقانون العقوبات رقم 58 لسنة 1937',
    cassationPrinciple: 'الطعن رقم 2180 لسنة 62 ق - القصور في استظهار الركن المادي في جريمة خيانة الأمانة أو التبديد يبطل الحكم.',
    practicalExample: 'الدفع بعدم تسلم المنقولات موضوع إيصال الأمانة كدليل على انعدام واقعة التسليم الوديعة.',
    category: 'جنائي',
  },
  {
    term: 'الشرط الفاسخ الصريح',
    linguisticDefinition: 'الفسخ هو نقض الشيء والتفريق بين أجزائه.',
    legalDefinition: 'اتفاق المتعاقدين على أن يعتبر العقد مفسوخاً من تلقاء نفسه دون حاجة لحكم قضائي عند إخلال أحد الطرفين بالتزاماته.',
    jurisprudenceNote: 'يسلب القاضي كل سلطة تقديرية في إمهال المدين متى تحقق عدم الوفاء ونبه عليه الدائن (المادة 158 مدني).',
    statutoryBasis: 'المادة 158 من القانون المدني المصري رقم 131 لسنة 1948',
    cassationPrinciple: 'الطعن رقم 512 لسنة 48 ق - تحقق الشرط الفاسخ الصريح يترتب عليه انفساخ العقد حتماً بمجرد تحقق الإخلال مع الإعذار ما لم يتنازل عنه الدائن صراحة أو ضمناً.',
    practicalExample: 'بند في عقد إيجار أو بيع ينص على انفساخ العقد تلقائياً في حال التأخر عن سداد القسط الشهري لمدة 15 يوماً.',
    category: 'مدني',
  },
  {
    term: 'دعوى الحسبة وبطلان الزواج',
    linguisticDefinition: 'الحسبة هي الأمر بالمعروف والنهي عن المنكر ابتغاء وجه الله.',
    legalDefinition: 'دعاوى تقام للمطالبة بحق عام أو تطبيق قواعد النظام العام في مسائل الأحوال الشخصية، نظمها المشرع المصري بقواعد قاصرة على النيابة العامة.',
    jurisprudenceNote: 'قصر القانون رقم 3 لسنة 1996 رفع دعاوى الحسبة على النيابة العامة منعاً للكيد والتشهير.',
    statutoryBasis: 'القانون رقم 3 لسنة 1996 بشأن إجراءات دعاوى الحسبة في الأحوال الشخصية',
    cassationPrinciple: 'الطعن رقم 102 لسنة 67 ق أحوال شخصية - عدم قبول أي دعوى حسبة مقامة من الأفراد دون وساطة النيابة العامة.',
    practicalExample: 'طلب إبطال زواج تم بالمخالفة لموانع التحريم الشرعي المؤبدة كزواج المحارم.',
    category: 'أسرة',
  },
  {
    term: 'بطلان القبض والتفتيش لانتفاء حالة التلبس',
    linguisticDefinition: 'التلبس هو مشاهدة الفعل في حال ارتكابه متلبساً به.',
    legalDefinition: 'بطلان الإجراء الضبطي الجنائي لكون مأمور الضبط القضائي قام بالقبض أو التفتيش دون إذن نيابة مسبق وفي غير الحالات الحصرية للتلبس بالمادة 30 إجراءات.',
    jurisprudenceNote: 'كل ما يبنى على باطل فهو باطل؛ بطلان القبض يستطيل إلى ما يترتب عليه من اعترافات أو أدلة مادية ناتجة عنه مباشرة.',
    statutoryBasis: 'المادتان 30 و34 من قانون الإجراءات الجنائية المصري رقم 150 لسنة 1950',
    cassationPrinciple: 'الطعن رقم 3051 لسنة 70 ق - التلبس صفة تلازم الجريمة لا شخص مرتكبها، ومجرد الارتباك أو الخوف لا يبيح لمأمور الضبط القبض أو التفتيش.',
    practicalExample: 'تفتيش سيارة في كمين دون إذن أو أمارات تدل على وقوع جناية أو جنحة معاقب عليها بالحبس.',
    category: 'جنائي',
  },
  {
    term: 'الدفوع الشكلية وسقوط الحق في إبدائها',
    linguisticDefinition: 'الشكل هو الصورة الخارجية التي يفرغ فيها الإجراء.',
    legalDefinition: 'الدفوع التي توجه إلى إجراءات الخصومة دون المساس بأصل الحق كالدفع بعدم الاختصاص المحلي، ويجب إبداؤها قبل التكلم في الموضوع.',
    jurisprudenceNote: 'نصت المادة 108 مرافعات على وجوب إبداء الدفع بالبطلان وعدم الاختصاص المحلي معاً قبل أي طلب أو دفاع في الدعوى.',
    statutoryBasis: 'المادة 108 من قانون المرافعات المدنية والتجارية',
    cassationPrinciple: 'الطعن رقم 870 لسنة 52 ق - الكلام في موضوع الدعوى يسقط الحق في التمسك بالدفوع الشكلية غير المتعلقة بالنظام العام.',
    practicalExample: 'تقديم مذكرة في موضوع النزاع ثم التمسك بعد ذلك بعدم اختصاص المحكمة محلياً.',
    category: 'مرافعات',
  },
  {
    term: 'المقاصة القضائية والاتفاقية',
    linguisticDefinition: 'المقاصة من التقاص وهو إسقاط دين بدين مقابله.',
    legalDefinition: 'انقضاء الدينين المتقابلين بقدر الأقل منهما، سواء تمت بقوة القانون أو باتفاق الطرفين أو بحكم القاضي.',
    jurisprudenceNote: 'يشترط للمقاصة القانونية أن يكون كلا الدينين نقوداً أو مثليات متحدة النوع ومحققة الوجود وخالية من النزاع ومستحقة الأداء.',
    statutoryBasis: 'المواد 362 حتى 368 من القانون المدني المصري',
    cassationPrinciple: 'الطعن رقم 912 لسنة 55 ق - لا تجوز المقاصة إذا كان أحد الدينين محل نزاع جدي إلا بطلب عارض أمام المحكمة.',
    practicalExample: 'تقاص المؤجر مع المستأجر بقيمة التأمين المودع مقابل التلفيات الثابتة بتقرير خبير.',
    category: 'مدني',
  },
];

class StorageService {
  private db: AppDatabase;

  constructor() {
    this.ensureDataDirectory();
    this.db = this.loadDatabase();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): AppDatabase {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading database, initializing fresh state', e);
    }

    const defaultState: AppDatabase = {
      auth: {
        masterPin: '000000',
        isDefaultPin: true,
        sessions: {},
      },
      gemini: {
        customApiKey: '',
        totalTokensUsed: 0,
        lastTestStatus: 'UNTESTED',
      },
      clients: [
        {
          id: 'client-1',
          name: 'الحاج محمود عبد الرازق الشريف',
          nationalId: '27501011200331',
          phone: '01098765432',
          email: 'm.elsharif@example.com',
          address: 'الجيزة - الدقي - شارع مصدق',
          notes: 'موكل قديم - قضايا تعويضات وعقارات',
          caseCount: 2,
          createdAt: Date.now() - 30 * 86400000,
        },
        {
          id: 'client-2',
          name: 'شركة النور للتجارة والتوريدات (ش.ذ.م.م)',
          nationalId: 'سجل تجاري 109283',
          phone: '01223456789',
          address: 'القاهرة الجديدة - التجمع الخامس',
          notes: 'عقد استشارات سنوي ومنازعات شيكات',
          caseCount: 1,
          createdAt: Date.now() - 15 * 86400000,
        },
      ],
      opponents: [
        {
          id: 'opp-1',
          name: 'شركة المقاولات المتحدة للتعمير',
          capacity: 'مدعى عليها',
          lawyerName: 'الأستاذ سامي الألفي المحامي بالنقض',
          lawyerPhone: '01122334455',
          notes: 'مطالبة بمستحقات مقاولة باطن وتعويض تأخير',
        },
        {
          id: 'opp-2',
          name: 'طارق حسني إبراهيم',
          capacity: 'متهم / ساحب الشيك',
          lawyerName: 'الأستاذ فريد الديب للمحاماة',
          notes: 'جنحة إصدار شيك بدون رصيد',
        },
      ],
      cases: [
        {
          id: 'case-1',
          caseNumber: '1420',
          year: '2026',
          court: 'محكمة شمال الجيزة الابتدائية',
          circuit: 'الدائرة 7 مدني كلي',
          caseType: 'مدني',
          clientId: 'client-1',
          clientName: 'الحاج محمود عبد الرازق الشريف',
          opponentName: 'شركة المقاولات المتحدة للتعمير',
          status: 'قيد التداول',
          claimSubject: 'إلزام المدعى عليها بدفع مبلغ 1,250,000 جنيه مصري قيمة مستخلصات ختامية وتعويض إخلال عقدي',
          requestsSummary: 'الحكم بفسخ العقد وإلزام الشركة بسداد المبلغ والفوائد القانونية 4% والمصروفات',
          assignedLawyer: 'الأستاذ عطية الهلباوي',
          totalAgreedFees: 80000,
          paidFees: 40000,
          nextSessionDate: '2026-11-28',
          createdAt: Date.now() - 20 * 86400000,
          notes: 'مطلوب إيداع تقرير مكتب خبراء وزارة العدل',
        },
        {
          id: 'case-2',
          caseNumber: '315',
          year: '2026',
          court: 'محكمة جنح الدقي الجزئية',
          circuit: 'دائرة الجنح المستأنفة',
          caseType: 'جنائي',
          clientId: 'client-2',
          clientName: 'شركة النور للتجارة والتوريدات',
          opponentName: 'طارق حسني إبراهيم',
          status: 'مؤجلة للحكم',
          claimSubject: 'جنحة إعطاء شيك بدون رصيد قابل للصرف بمبلغ 450,000 جنيه',
          requestsSummary: 'تأييد حكم أول درجة بالحبس ثلاث سنوات مع الشغل والتعويض المؤقت',
          assignedLawyer: 'الأستاذ عطية الهلباوي',
          totalAgreedFees: 35000,
          paidFees: 35000,
          nextSessionDate: '2026-11-20',
          createdAt: Date.now() - 10 * 86400000,
          notes: 'تم تقديم أصل الشيك وإفادة البنك الأهلي بالرفض',
        },
      ],
      sessions: [
        {
          id: 'sess-1',
          caseId: 'case-1',
          caseNumber: '1420 لسنة 2026 مدني كلي شمال الجيزة',
          sessionDate: '2026-11-28',
          courtName: 'مجمع محاكم تاج الدول - إمبابة',
          circuit: 'الدائرة 7 مدني كلي',
          decisionRequested: 'متابعة ورود تقرير مكتب الخبراء والاطلاع عليه والرد بمذكرة دفاع',
          attendanceLawyer: 'المستشار عطية الهلباوي',
          status: 'قادمة',
        },
        {
          id: 'sess-2',
          caseId: 'case-2',
          caseNumber: '315 لسنة 2026 جنح مستأنف الدقي',
          sessionDate: '2026-11-20',
          courtName: 'محكمة الجيزة الابتدائية بشارع السودان',
          circuit: 'جنح مستأنف',
          decisionRequested: 'النطق بالحكم في الاستئناف المقام من المتهم',
          attendanceLawyer: 'المستشار عطية الهلباوي',
          status: 'قادمة',
        },
      ],
      documents: [
        {
          id: 'doc-1',
          caseId: 'case-1',
          title: 'مذكرة دفاع في الدعوى رقم 1420 لسنة 2026 مدني كلي',
          type: 'مذكرة دفاع',
          content: 'بدفاع السيد / محمود عبد الرازق الشريف (مدعٍ) ضد شركة المقاولات المتحدة (مدعى عليها)... تلتمس رفض الدفع بعدم قبول الدعوى لرفعها قبل الأوان وتأسيس استحقاق المبلغ استناداً للمادة 147 و157 من القانون المدني.',
          parties: [
            { name: 'محمود عبد الرازق الشريف', role: 'مدعٍ' },
            { name: 'شركة المقاولات المتحدة', role: 'مدعى عليها' },
          ],
          status: 'معتمد',
          createdAt: Date.now() - 5 * 86400000,
          updatedAt: Date.now() - 5 * 86400000,
        },
      ],
      tasks: [
        {
          id: 'task-1',
          title: 'استخراج شهادة من واقع جدول محكمة الاستئناف',
          description: 'التحقق من عدم رفع استئناف على الحكم الصادر في الدعوى 889',
          dueDate: '2026-11-16',
          assignedTo: 'أحمد كمال (محامي الجدول)',
          priority: 'عاجل جداً',
          status: 'قيد التنفيذ',
        },
        {
          id: 'task-2',
          title: 'سداد أمانة الخبير في خزينة المحكمة',
          description: 'سداد مبلغ 3000 جنيه أمانة خبير الدعوى 1420 وإيداع الإيصال بالسكرتارية',
          dueDate: '2026-11-18',
          assignedTo: 'محمد صابر (مندوب الإعلانات القضائية)',
          priority: 'عاجل جداً',
          status: 'معلق',
        },
      ],
      financials: [
        {
          id: 'fin-1',
          type: 'أتعاب مقبوضة',
          caseId: 'case-1',
          clientName: 'محمود عبد الرازق الشريف',
          amount: 40000,
          date: '2026-11-01',
          receiptNumber: 'REC-2026-089',
          paymentMethod: 'تحويل بنكي',
          notes: 'الدفعة المقدمة من عقد الأتعاب',
        },
        {
          id: 'fin-2',
          type: 'أتعاب مقبوضة',
          caseId: 'case-2',
          clientName: 'شركة النور للتجارة',
          amount: 35000,
          date: '2026-11-05',
          receiptNumber: 'REC-2026-092',
          paymentMethod: 'نقدي',
          notes: 'سداد كامل الأتعاب المتفق عليها',
        },
      ],
      subscriptions: [
        {
          id: 'sub-demo-1',
          payerName: 'الأستاذ إبراهيم فتحي المحامي',
          phone: '01011223344',
          amount: 500,
          referenceNumber: 'VF-981247012',
          transferDate: '2026-11-10',
          targetWallet: '01153747612',
          status: 'APPROVED',
          adminNotes: 'تم التحقق من التحويل على محفظة كاش بنجاح واعتمد الحساب',
          reviewedAt: Date.now() - 86400000,
        },
      ],
      conversations: [
        {
          id: 'conv-welcome',
          title: 'مرحبا بك في صرح المستشار عطية الهلباوي',
          createdAt: Date.now() - 3600000,
          updatedAt: Date.now(),
          category: 'legal',
          pinned: true,
          messageCount: 2,
        },
      ],
      messages: [
        {
          id: 'msg-1',
          conversationId: 'conv-welcome',
          sender: 'assistant',
          content: 'بسم الله الرحمن الرحيم، أهلاً وسهلاً بك في المنصة الذكية الملكية للأستاذ المستشار عطية الهلباوي. أنا جاهز لمعاونتك في كافة المسائل القانونية، صياغة المذكرات والعقود، فحص المستندات والمحاضر المصورة، وتحليل القضايا وإدارة شؤون المكتب القضائي بكل دقة.',
          engineUsed: 'ATTYA LEGAL MIND',
          timestamp: Date.now() - 3600000,
          isVerified: true,
        },
      ],
      dictionary: INITIAL_DICTIONARY,
      auditLogs: [
        {
          timestamp: Date.now(),
          action: 'SYSTEM_BOOT',
          details: 'تهيئة نظام المستشار عطية الهلباوي والعقل المركزي ذي الـ 16 وحدة وقاعدة البيانات الدائمة بنجاح',
        },
      ],
    };

    this.saveDatabase(defaultState);
    return defaultState;
  }

  public save(): void {
    this.saveDatabase(this.db);
  }

  private saveDatabase(data: AppDatabase) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database', e);
    }
  }

  // --- Auth & PIN ---
  public verifyPin(pin: string): { success: boolean; isDefaultPin: boolean; token?: string } {
    if (this.db.auth.masterPin === pin) {
      const token = 'token_' + Math.random().toString(36).substring(2) + Date.now();
      this.db.auth.sessions[token] = {
        role: 'ADMIN',
        expiresAt: Date.now() + 7 * 86400000, // 7 days
      };
      this.save();
      return { success: true, isDefaultPin: this.db.auth.isDefaultPin, token };
    }
    return { success: false, isDefaultPin: this.db.auth.isDefaultPin };
  }

  public changePin(oldPin: string, newPin: string): { success: boolean; message: string } {
    if (this.db.auth.masterPin !== oldPin) {
      return { success: false, message: 'رمز الدخول الحالي غير صحيح' };
    }
    if (!newPin || newPin.length < 6) {
      return { success: false, message: 'يجب ألا يقل الرمز الجديد عن 6 أرقام أو حروف' };
    }
    this.db.auth.masterPin = newPin;
    this.db.auth.isDefaultPin = false;
    this.addAuditLog('CHANGE_PIN', 'تم تغيير الرمز السري الرئيسي من الإعداد الأولي');
    this.save();
    return { success: true, message: 'تم تغيير رمز الدخول بنجاح وتأمين لوحة التحكم' };
  }

  public isValidSession(token?: string): boolean {
    if (!token) return false;
    const session = this.db.auth.sessions[token];
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
      delete this.db.auth.sessions[token];
      this.save();
      return false;
    }
    return true;
  }

  // --- Gemini Config ---
  public getGeminiStatus(): GeminiConfigStatus {
    const envKey = process.env.GEMINI_API_KEY || '';
    const customKey = this.db.gemini.customApiKey || '';
    const hasKey = !!(envKey || customKey);

    return {
      isConfigured: hasKey,
      hasCustomKey: !!customKey,
      activeModel: 'gemini-3.8-flash',
      totalTokensUsed: this.db.gemini.totalTokensUsed,
      lastTestStatus: this.db.gemini.lastTestStatus,
      lastTestedAt: this.db.gemini.lastTestedAt,
      errorMessage: this.db.gemini.errorMessage,
    };
  }

  public setCustomGeminiKey(key: string): void {
    this.db.gemini.customApiKey = key.trim();
    this.db.gemini.lastTestStatus = 'UNTESTED';
    this.db.gemini.errorMessage = undefined;
    this.addAuditLog('UPDATE_GEMINI_KEY', 'تم تحديث مفتاح Gemini API في الخادم');
    this.save();
  }

  public recordGeminiUsage(tokens: number, success: boolean, error?: string): void {
    if (tokens > 0) this.db.gemini.totalTokensUsed += tokens;
    this.db.gemini.lastTestedAt = Date.now();
    this.db.gemini.lastTestStatus = success ? 'SUCCESS' : 'FAILED';
    if (error) this.db.gemini.errorMessage = error;
    this.save();
  }

  public getActiveGeminiKey(): string {
    const key = this.db.gemini.customApiKey || process.env.GEMINI_API_KEY || '';
    if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
      return '';
    }
    return key.trim();
  }

  // --- Law Office CRUD & Practice Management ---
  public getClients() { return this.db.clients; }
  public addClient(c: Omit<Client, 'id' | 'createdAt'>): Client {
    const client: Client = { ...c, id: 'client-' + Date.now(), createdAt: Date.now() };
    this.db.clients.unshift(client);
    this.addAuditLog('ADD_CLIENT', `إضافة الموكل: ${client.name}`);
    this.save();
    return client;
  }

  public getOpponents() { return this.db.opponents; }
  public addOpponent(o: Omit<Opponent, 'id'>): Opponent {
    const opp: Opponent = { ...o, id: 'opp-' + Date.now() };
    this.db.opponents.unshift(opp);
    this.save();
    return opp;
  }

  public getCases() { return this.db.cases; }
  public addCase(item: Omit<LegalCase, 'id' | 'createdAt'>): LegalCase {
    const newCase: LegalCase = { ...item, id: 'case-' + Date.now(), createdAt: Date.now() };
    this.db.cases.unshift(newCase);
    this.addAuditLog('ADD_CASE', `قيد القضية رقم ${newCase.caseNumber} لسنة ${newCase.year} بمحكمة ${newCase.court}`);
    this.save();
    return newCase;
  }

  public getSessions() { return this.db.sessions; }
  public addSession(s: Omit<CourtSession, 'id'>): CourtSession {
    const session: CourtSession = { ...s, id: 'sess-' + Date.now() };
    this.db.sessions.unshift(session);
    this.save();
    return session;
  }

  public getDocuments() { return this.db.documents; }
  public addDocument(d: Omit<LegalDocument, 'id' | 'createdAt' | 'updatedAt'>): LegalDocument {
    const doc: LegalDocument = {
      ...d,
      id: 'doc-' + Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.db.documents.unshift(doc);
    this.addAuditLog('ADD_DOCUMENT', `صياغة مستند جديد: ${doc.title}`);
    this.save();
    return doc;
  }

  public getTasks() { return this.db.tasks; }
  public addTask(t: Omit<OfficeTask, 'id'>): OfficeTask {
    const task: OfficeTask = { ...t, id: 'task-' + Date.now() };
    this.db.tasks.unshift(task);
    this.save();
    return task;
  }
  public updateTaskStatus(id: string, status: OfficeTask['status']) {
    const task = this.db.tasks.find((t) => t.id === id);
    if (task) {
      task.status = status;
      this.save();
    }
  }

  public getFinancials() { return this.db.financials; }
  public addFinancial(f: Omit<FinancialRecord, 'id'>): FinancialRecord {
    const fin: FinancialRecord = { ...f, id: 'fin-' + Date.now() };
    this.db.financials.unshift(fin);
    this.save();
    return fin;
  }

  // --- Subscriptions (500 EGP / 01153747612) ---
  public getSubscriptions() { return this.db.subscriptions; }
  public addSubscription(sub: Omit<CashSubscription, 'id' | 'status' | 'targetWallet'>): CashSubscription {
    const newSub: CashSubscription = {
      ...sub,
      id: 'sub-' + Date.now(),
      targetWallet: '01153747612',
      status: 'PENDING',
    };
    this.db.subscriptions.unshift(newSub);
    this.addAuditLog('NEW_SUBSCRIPTION_REQUEST', `طلب اشتراك جديد من ${sub.payerName} بمبلغ ${sub.amount} ج.م`);
    this.save();
    return newSub;
  }

  public updateSubscriptionStatus(id: string, status: 'APPROVED' | 'REJECTED', notes?: string) {
    const item = this.db.subscriptions.find((s) => s.id === id);
    if (item) {
      item.status = status;
      item.adminNotes = notes;
      item.reviewedAt = Date.now();
      this.addAuditLog('SUBSCRIPTION_STATUS_CHANGE', `تغيير حالة اشتراك ${item.payerName} إلى ${status}`);
      this.save();
      return item;
    }
    return null;
  }

  // --- Conversations & Messages ---
  public getConversations() { return this.db.conversations; }
  public getConversation(id: string) { return this.db.conversations.find((c) => c.id === id); }
  public createConversation(title: string, category: Conversation['category'] = 'legal', caseId?: string): Conversation {
    const conv: Conversation = {
      id: 'conv-' + Date.now(),
      title: title || 'محادثة قانونية جديدة',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      category,
      caseId,
      messageCount: 0,
    };
    this.db.conversations.unshift(conv);
    this.save();
    return conv;
  }

  public deleteConversation(id: string): boolean {
    const idx = this.db.conversations.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.db.conversations.splice(idx, 1);
      this.db.messages = this.db.messages.filter((m) => m.conversationId !== id);
      this.save();
      return true;
    }
    return false;
  }

  public getMessages(conversationId: string): ChatMessage[] {
    return this.db.messages.filter((m) => m.conversationId === conversationId);
  }

  public addMessage(m: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const msg: ChatMessage = {
      ...m,
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };
    this.db.messages.push(msg);

    const conv = this.db.conversations.find((c) => c.id === m.conversationId);
    if (conv) {
      conv.updatedAt = Date.now();
      conv.messageCount = (conv.messageCount || 0) + 1;
    }
    this.save();
    return msg;
  }

  // --- Legal Dictionary ---
  public getDictionary(query?: string): LegalDictionaryEntry[] {
    if (!query) return this.db.dictionary;
    const q = query.trim().toLowerCase();
    return this.db.dictionary.filter(
      (d) =>
        d.term.toLowerCase().includes(q) ||
        d.legalDefinition.toLowerCase().includes(q) ||
        (d.statutoryBasis && d.statutoryBasis.toLowerCase().includes(q)) ||
        (d.cassationPrinciple && d.cassationPrinciple.toLowerCase().includes(q))
    );
  }

  public addDictionaryEntry(entry: LegalDictionaryEntry): void {
    this.db.dictionary.unshift(entry);
    this.save();
  }

  // --- Audit Logs ---
  public addAuditLog(action: string, details: string) {
    this.db.auditLogs.unshift({
      timestamp: Date.now(),
      action,
      details,
    });
    // keep maximum 500 audit entries
    if (this.db.auditLogs.length > 500) {
      this.db.auditLogs = this.db.auditLogs.slice(0, 500);
    }
  }

  public getAuditLogs() {
    return this.db.auditLogs;
  }
}

export const storage = new StorageService();
