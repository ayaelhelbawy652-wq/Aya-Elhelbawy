/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { storage } from '../server/storage.ts';
import { Attachment, EngineMode } from '../types/index.ts';

// Re-export all 16 pure units and type definitions from brainUnits.ts
export * from './brainUnits.ts';
import {
  LanguageContextUnit,
  IntentDetectionUnit,
  MemoryManagementUnit,
  LogicalReasoningUnit,
  EgyptianLegalAnalysisUnit,
  LanguageDialectsStyleUnit,
  DocumentUnderstandingUnit,
  VisionOcrUnit,
  AudioProcessingUnit,
  GeneralKnowledgeUnit,
  SearchRetrievalUnit,
  ComparisonContradictionsUnit,
  LegalCalculationUnit,
  TaskPlanningUnit,
  AnswerVerificationUnit,
  DraftingOutputUnit,
  LanguageContextReport,
  UserIntentReport,
  DispatchResult,
  ClassificationKey,
  RoutedEngineCategory,
} from './brainUnits.ts';

export interface BrainProcessInput {
  userInput: string;
  conversationId: string;
  engineMode: EngineMode;
  attachments?: Attachment[];
  audioBase64?: string;
  caseId?: string;
}

export interface BrainProcessOutput {
  responseContent: string;
  engineUsed: 'ATTYA LEGAL MIND' | 'GEMINI 3.8 FLASH' | 'AUTOMATIC';
  activePersona: 'المحاور العام' | 'المستشار القانوني المصري' | 'مولد العقود والمذكرات';
  classificationKey: ClassificationKey;
  routedCategory: RoutedEngineCategory;
  legalTags: string[];
  extractedFacts?: string[];
  missingElements?: string[];
  suggestedAction?: string;
  isVerified: boolean;
  transcription?: string;
  intentSummary: string;
}

export interface CentralBrainUnitMeta {
  id: number;
  code: string;
  nameAr: string;
  roleAr: string;
  status: 'ACTIVE' | 'TESTED';
}

// =========================================================================
// CENTRAL BRAIN SERVICE (العقل المركزي المتكامل)
// =========================================================================

export class CentralBrainService {
  // تعريف الوحدات الـ 16 كفئات متخصصة
  public readonly languageContextUnit = new LanguageContextUnit();
  public readonly intentDetectionUnit = new IntentDetectionUnit(this.languageContextUnit);
  public readonly memoryManagementUnit = new MemoryManagementUnit();
  public readonly logicalReasoningUnit = new LogicalReasoningUnit();
  public readonly egyptianLegalAnalysisUnit = new EgyptianLegalAnalysisUnit();
  public readonly languageDialectsStyleUnit = new LanguageDialectsStyleUnit();
  public readonly documentUnderstandingUnit = new DocumentUnderstandingUnit();
  public readonly visionOcrUnit = new VisionOcrUnit();
  public readonly audioProcessingUnit = new AudioProcessingUnit();
  public readonly generalKnowledgeUnit = new GeneralKnowledgeUnit();
  public readonly searchRetrievalUnit = new SearchRetrievalUnit();
  public readonly comparisonContradictionsUnit = new ComparisonContradictionsUnit();
  public readonly legalCalculationUnit = new LegalCalculationUnit();
  public readonly taskPlanningUnit = new TaskPlanningUnit();
  public readonly answerVerificationUnit = new AnswerVerificationUnit();
  public readonly draftingOutputUnit = new DraftingOutputUnit();

  // مسميات متوافقة مع الترقيم العددي unit1..unit16
  public readonly unit1 = this.languageContextUnit;
  public readonly unit2 = this.intentDetectionUnit;
  public readonly unit3 = this.memoryManagementUnit;
  public readonly unit4 = this.logicalReasoningUnit;
  public readonly unit5 = this.egyptianLegalAnalysisUnit;
  public readonly unit6 = this.languageDialectsStyleUnit;
  public readonly unit7 = this.documentUnderstandingUnit;
  public readonly unit8 = this.visionOcrUnit;
  public readonly unit9 = this.audioProcessingUnit;
  public readonly unit10 = this.generalKnowledgeUnit;
  public readonly unit11 = this.searchRetrievalUnit;
  public readonly unit12 = this.comparisonContradictionsUnit;
  public readonly unit13 = this.legalCalculationUnit;
  public readonly unit14 = this.taskPlanningUnit;
  public readonly unit15 = this.answerVerificationUnit;
  public readonly unit16 = this.draftingOutputUnit;

  /**
   * Dispatcher:
   * طريقة التوجيه المركزية التي تصنف المدخلات إلى فئتي 'general' أو 'legal'
   * وتوجهها إلى المحرك المناسب بناءً على الكلمات المفتاحية وسياق المحادثة.
   */
  public dispatcher(
    userInput: string,
    history: any[] = [],
    attachments: Attachment[] = [],
    caseId?: string
  ): DispatchResult {
    return this.intentDetectionUnit.dispatch(userInput, history, attachments, caseId);
  }

  public dispatch(
    userInput: string,
    history: any[] = [],
    attachments: Attachment[] = [],
    caseId?: string
  ): DispatchResult {
    return this.dispatcher(userInput, history, attachments, caseId);
  }

  public getUnitsRegistry(): CentralBrainUnitMeta[] {
    return [
      { id: 1, code: 'UNIT_1_LANGUAGE_CONTEXT', nameAr: 'وحدة فهم اللغة والسياق', roleAr: 'تحليل اللغة، اللهجة المصرية، الفصحى، واستخراج الكيانات وتاريخ الحوار', status: 'ACTIVE' },
      { id: 2, code: 'UNIT_2_INTENT_DETERMINATION', nameAr: 'وحدة تحديد نية المستخدم', roleAr: 'تطبيق مفتاح التصنيف وتوجيه المدخلات بين المحاور العام والقانوني والمولد', status: 'ACTIVE' },
      { id: 3, code: 'UNIT_3_MEMORY_MANAGEMENT', nameAr: 'وحدة إدارة الذاكرة', roleAr: 'حفظ واسترجاع سياق المحادثة وربطها بملفات القضايا', status: 'ACTIVE' },
      { id: 4, code: 'UNIT_4_LOGICAL_REASONING', nameAr: 'وحدة الاستدلال المنطقي', roleAr: 'الربط المنطقي بين مقدمات الوقائع والنتائج دون قفزات عشوائية', status: 'ACTIVE' },
      { id: 5, code: 'UNIT_5_EGYPTIAN_LEGAL_ANALYSIS', nameAr: 'وحدة التحليل القانوني المصري', roleAr: 'تكييف الوقائع استناداً للتشريعات المصرية وأحكام محكمة النقض', status: 'ACTIVE' },
      { id: 6, code: 'UNIT_6_LANGUAGE_STYLE_DIALECT', nameAr: 'وحدة اللغة واللهجات والأسلوب', roleAr: 'معايرة النبرة الحوارية (ودية اجتماعية أو قضائية وقورة رصينة)', status: 'ACTIVE' },
      { id: 7, code: 'UNIT_7_DOCUMENT_UNDERSTANDING', nameAr: 'وحدة قراءة المستندات', roleAr: 'استخراج نصوص العقود والمذكرات وملفات PDF وWord والجداول', status: 'ACTIVE' },
      { id: 8, code: 'UNIT_8_VISION_OCR', nameAr: 'وحدة فهم الصور (OCR)', roleAr: 'استخراج وقراءة نصوص المحاضر الرسمية والتوكيلات المصورة', status: 'ACTIVE' },
      { id: 9, code: 'UNIT_9_AUDIO_PROCESSING', nameAr: 'وحدة معالجة الصوت', roleAr: 'تفريغ الصوت إلى نص عربي (ASR) ودعم الاستماع الصوتي', status: 'ACTIVE' },
      { id: 10, code: 'UNIT_10_GENERAL_KNOWLEDGE', nameAr: 'وحدة المعرفة العامة', roleAr: 'المحاور العام في العلوم، الثقافة، تنظيم الأعمال، والتطوير الشخصي', status: 'ACTIVE' },
      { id: 11, code: 'UNIT_11_SEARCH_RETRIEVAL', nameAr: 'وحدة البحث والاسترجاع', roleAr: 'استحضار المواد القانونية والنصوص الفقهية والمبادئ القضائية المعتمدة', status: 'ACTIVE' },
      { id: 12, code: 'UNIT_12_COMPARISON_CONTRADICTIONS', nameAr: 'وحدة المقارنة وكشف التناقضات', roleAr: 'كشف الثغرات العقدية، توقيعات البياض، ومغايرة أقوال الخصوم', status: 'ACTIVE' },
      { id: 13, code: 'UNIT_13_LEGAL_COMPUTATION', nameAr: 'وحدة الحساب والتحليل الرقمي', roleAr: 'حساب الفوائد القانونية (4% و5%)، مدد الاستئناف، والتقادم، وحصص التركات', status: 'ACTIVE' },
      { id: 14, code: 'UNIT_14_TASK_PLANNING', nameAr: 'وحدة التخطيط وتنفيذ المهام', roleAr: 'بناء خارطة طريق إجرائية للقضية وقوائم الإعلانات ومواعيد الجلسات', status: 'ACTIVE' },
      { id: 15, code: 'UNIT_15_ANSWER_VERIFICATION', nameAr: 'وحدة مراجعة الإجابات والتحقق', roleAr: 'تدقيق الأسانيد، ومنع الهلوسة، وحظر تلفيق أرقام الطعون والمواد', status: 'ACTIVE' },
      { id: 16, code: 'UNIT_16_DRAFTING_OUTPUT', nameAr: 'وحدة الصياغة وإنتاج المخرجات', roleAr: 'مولد العقود والمذكرات القضائية بتنسيق طباعي ملكي محكم', status: 'ACTIVE' },
    ];
  }

  /**
   * خط الأنابيب المركزي: معالجة وتنسيق الاستفسار وتوجيهه للمحرك والشخصية المناسبة
   */
  public async processRequest(input: BrainProcessInput): Promise<BrainProcessOutput> {
    const { userInput, conversationId, engineMode, attachments = [], audioBase64, caseId } = input;

    // --- UNIT 3: إدارة الذاكرة ---
    const allMessages = storage.getMessages(conversationId);
    const memory = this.unit3.retrieveContext(allMessages, conversationId);

    // --- UNIT 9: معالجة الصوت ---
    let speechTranscription = '';
    if (audioBase64) {
      speechTranscription = this.unit9.transcribeSpeech(audioBase64);
    }
    const effectiveText = (userInput || '') + (speechTranscription ? ` ${speechTranscription}` : '');

    // --- UNIT 1 & 2: فهم اللغة وتحديد النية عبر الموجه المركزي (Dispatcher) ---
    const dispatchInfo = this.dispatcher(effectiveText, memory, attachments, caseId);
    const contextReport = this.unit1.analyze(effectiveText, memory);
    const intentReport = this.unit2.classify(contextReport, attachments, caseId);

    // --- UNIT 7 & 8: قراءة المستندات وفهم الصور (Multimodal) ---
    const docInsights = this.unit7.parseDocuments(attachments);
    const visionInsights = this.unit8.parseOfficialPoliceReports(attachments);
    const mediaInsights = [docInsights, visionInsights].filter(Boolean).join('\n');

    // --- UNIT 11: البحث والاسترجاع القانوني ---
    const statutoryContext = this.unit11.retrieveStatutesAndPrecedents(contextReport, intentReport);

    // --- UNIT 12: المقارنة وكشف التناقضات ---
    const contradictions = this.unit12.detectLoopholesAndContradictions(contextReport, attachments);

    // --- UNIT 13: الحساب والتحليل الرقمي ---
    const calculationNotes = this.unit13.computeStatutoryTerms(contextReport);

    // --- اتخاذ قرار توجيه المحرك ---
    let chosenEngine: 'ATTYA LEGAL MIND' | 'GEMINI 3.8 FLASH';
    const activeGeminiKey = storage.getActiveGeminiKey();
    const geminiStatus = storage.getGeminiStatus();
    const isGeminiHealthy = Boolean(
      activeGeminiKey &&
      (geminiStatus.lastTestStatus !== 'FAILED' || (Date.now() - (geminiStatus.lastTestedAt || 0) > 60000))
    );

    if (engineMode === 'ATTYA_LEGAL_MIND') {
      chosenEngine = 'ATTYA LEGAL MIND';
    } else if (engineMode === 'GEMINI') {
      chosenEngine = 'GEMINI 3.8 FLASH';
    } else {
      // الوضع التلقائي AUTOMATIC: الاعتماد الفوري على محرك المستشار المحلي ATTYA LEGAL MIND
      // أو استخدام Gemini فقط إذا كان المفتاح نشطاً ومستقراً والمهمة تستدعي ذلك كفحص المرفقات والوسائط
      if (isGeminiHealthy && (dispatchInfo.classificationKey === 'DOCUMENT_OCR_MEDIA' || (dispatchInfo.engine === 'GEMINI 3.8 FLASH' && activeGeminiKey))) {
        chosenEngine = 'GEMINI 3.8 FLASH';
      } else {
        chosenEngine = 'ATTYA LEGAL MIND';
      }
    }

    // شارة الشخصية النشطة
    const personaLabel = dispatchInfo.persona;

    // --- توليد الإجابة عبر المحرك الموجه ---
    let generatedRawText = '';

    if (chosenEngine === 'GEMINI 3.8 FLASH' && activeGeminiKey) {
      try {
        const geminiRes = await this.executeGeminiEngine(
          effectiveText,
          memory,
          attachments,
          mediaInsights,
          contextReport,
          intentReport,
          statutoryContext
        );
        generatedRawText = geminiRes.text;
        storage.recordGeminiUsage(1, true);
      } catch (err: any) {
        // التحويل السلس والآمن إلى محرك ATTYA LEGAL MIND المستقل عند انشغال خوادم Gemini أو انتهاء المهلة
        storage.recordGeminiUsage(0, false, err?.message || 'انشغال مؤقت في خوادم السحاب، تم التحويل تلقائياً لمحرك المستشار عطية الهلباوي المحلي');
        chosenEngine = 'ATTYA LEGAL MIND';
        generatedRawText = this.executeAttyaLegalMind(
          effectiveText,
          contextReport,
          intentReport,
          statutoryContext,
          mediaInsights,
          calculationNotes,
          caseId
        );
      }
    } else {
      chosenEngine = 'ATTYA LEGAL MIND';
      generatedRawText = this.executeAttyaLegalMind(
        effectiveText,
        contextReport,
        intentReport,
        statutoryContext,
        mediaInsights,
        calculationNotes,
        caseId
      );
    }

    // --- UNIT 14: التخطيط وتنفيذ المهام ---
    const roadmap = this.unit14.generateActionRoadmap(intentReport);

    // --- UNIT 15: مراجعة الإجابات والتحقق ---
    const verificationResult = this.unit15.verifyAnswer(generatedRawText);
    let isVerified = verificationResult.isValid;
    if (!verificationResult.isValid && verificationResult.warning) {
      generatedRawText += `\n\n> ⚖️ **تنبيه مراجعة السند:** ${verificationResult.warning}`;
    }

    // --- UNIT 16: الصياغة وإنتاج المخرجات الملكية ---
    const finalPolishedOutput = this.unit16.formatRoyalOutput(
      generatedRawText,
      contradictions,
      calculationNotes,
      roadmap,
      intentReport
    );

    // استخراج الوسوم القانونية
    const legalTags = this.extractLegalTags(effectiveText + ' ' + finalPolishedOutput);

    return {
      responseContent: finalPolishedOutput,
      engineUsed: chosenEngine,
      activePersona: personaLabel,
      classificationKey: dispatchInfo.classificationKey,
      routedCategory: dispatchInfo.category,
      legalTags,
      isVerified,
      transcription: speechTranscription || undefined,
      intentSummary: `${dispatchInfo.classificationKey} (${dispatchInfo.reasoning}) [Category: ${dispatchInfo.category}]`,
    };
  }

  // =========================================================================
  // ATTYA LEGAL MIND (Standalone Local Rules Engine)
  // =========================================================================
  private executeAttyaLegalMind(
    userInput: string,
    ctx: LanguageContextReport,
    intent: UserIntentReport,
    statutoryContext: string[],
    mediaInsights: string,
    calculationNotes?: string,
    caseId?: string
  ): string {
    if (intent.classificationKey === 'GENERAL_CHAT') {
      return this.handleGeneralConversation(userInput, ctx);
    }

    if (intent.classificationKey === 'CONTRACT_DRAFTING') {
      return this.generateLegalDraft(userInput, ctx);
    }

    return this.handleLegalConsultation(userInput, ctx, intent, statutoryContext, mediaInsights);
  }

  private handleGeneralConversation(input: string, ctx: LanguageContextReport): string {
    const q = input.toLowerCase();

    if (/صباح الخير|مساء الخير|سلام عليكم|السلام عليكم|أهلاً|ازيك|إزيك|مرحبا/i.test(q)) {
      return `أهلاً ومرحباً بك يا فندم! أنا معك، المستشار عطية الهلباوي. يسعدني دائماً التواصل معك ومشاركتك الرأي في كافة المسائل العامة والعملية والفكرية.

كيف أستطيع مساعدتك اليوم؟`;
    }

    if (/نصيحة|تنظيم الوقت|إدارة الوقت|شغل|مشروع|أفكار/i.test(q)) {
      return `أهلاً بك يا فندم. لتنظيم يومك وعملك بأعلى كفاءة، إليك منهجية عملية مجربة:

1. **قاعدة الـ 3 أولويات الكبرى:** حدد أهم ثلاث مهام رئيسية في بداية اليوم ولا تبدأ في غيرها حتى تكتمل.
2. **فصل التخطيط عن التنفيذ:** خصص 15 دقيقة كل مساء لمراجعة مهام الغد، حتى تبدأ صباحك بذهن صافٍ دون تشتت.
3. **تفريغ المهام فوراً:** لا تحتفظ بالمهام والمواعيد في ذاكرتك المجردة؛ قيدها فوراً في جدول أعمال منظم.
4. **فترات التركيز العميق (Deep Work):** 45 دقيقة عمل مركز تماماً بدون هواتف أو مقاطعات، تعقبها 10 دقائق استراحة.

يسعدني دائماً مساعدتك في ترتيب أفكارك أو صياغة أي خطة عمل تحتاجها.`;
    }

    return `أهلاً بك يا فندم، المستشار عطية الهلباوي في خدمتك. يسعدني دائماً تبادل الأفكار والنقاش حول كل ما يشغل اهتمامك الثقافي، المهني، أو الشخصي بكل ود واحترام.

تفضل بطرح ما ترغب في استعراضه وسأكون معك خطوة بخطوة.`;
  }

  private handleLegalConsultation(
    input: string,
    ctx: LanguageContextReport,
    intent: UserIntentReport,
    statutoryContext: string[],
    mediaInsights: string
  ): string {
    const q = input.toLowerCase();

    if (/إيصال أمانة|ايصال امانة/i.test(q)) {
      return `### ⚖️ الرأي القانوني للمستشار عطية الهلباوي في قضايا إيصالات الأمانة:

**أولاً - التكييف القانوني السليم:**
تخضع الواقعة لأحكام المادة **341 من قانون العقوبات المصري** (جريمة خيانة الأمانة)، حيث يفترض القانون تسلم المتهم للمال على سبيل الأمانة لتوصيله إلى طرف ثالث محدد.

**ثانياً - الأركان الأساسية للجريمة:**
1. **الركن المادي:** ثبوت واقعة التسليم الحقيقي الفعلي للمال (وليس مجرد التوقيع)، وفعل الاختلاس أو التبديد.
2. **الركن المعنوي:** القصد الجنائي وانصراف إرادة الساحب إلى الاستيلاء على المال بنية التملك والإضرار بالمجني عليه.

**ثالثاً - الدفوع الجوهرية المؤثرة في دفاع المتهم:**
- **الدفع بانتفاء ركن التسليم:** إثبات أن الإيصال حرر كضمان لمعاملة مدنية أو تجارية ولم يكن هناك تسليم حقيقي لنقود (استناداً لحكم محكمة النقض في الطعن رقم 2180 لسنة 62 ق).
- **الدفع بالطعن بالتزوير صلباً:** عند ثبوت توقيع الإيصال على بياض وملء صلب الإيصال في تاريخ لاحق بواسطة شخص آخر وبمداد مغاير.

**رابعاً - التوصية الإجرائية:**
- إذا كنت الشاكي: التقدم بالجنحة المباشرة أو المحضر الإداري مصحوباً بأصل الإيصال وصورة بطاقة المتهم.
- إذا كنت المتهم: طلب الإحالة للطب الشرعي لفحص معاصرة التوقيع للصلب وإثبات مدنية النزاع عبر شهود المعاملة الأصلية.`;
    }

    if (/شيك|شيك بدون رصيد/i.test(q)) {
      return `### ⚖️ التكييف القانوني لجريمة إعطاء شيك بدون رصيد:

**السند التشريعي:**
المواد **473 حتى 539 من قانون التجارة المصري رقم 17 لسنة 1999** المعدل.

**المبادئ القضائية المستقرة:**
1. الشيك في القانون التجاري المصري أداة وفاء تجري مجرى النقود، ولا عبرة بالباعث على إصداره أو كونه شيك ضمان إلا إذا ثبت خروجه عن التداول بطريق غير مشروع (كالسرقة أو الضياع أو الإكراه).
2. قيام الجريمة بمجرد إصدار الشيك مع العلم بعدم وجود رصيد قائم وقابل للسحب أو استرداد الرصيد بعد الإصدار.

**المواعيد والإجراءات:**
- يلزم الحصول على إفادة رسمية من البنك المسحوب عليه برفض الصرف لعدم كفاية الرصيد.
- تقديم الشكوى أو تحريك الدعوى الجنائية قبل مضي المواعيد القانونية لسقوط الحق في الشكوى (المادة 3 من قانون الإجراءات الجنائية).`;
    }

    if (/طلاق|خلع|نفقة|حضانة|أحوال شخصية/i.test(q)) {
      return `### ⚖️ الرأي الشرعي والقانوني في منازعات الأحوال الشخصية المصرية:

**السند التشريعي:**
القانون رقم **1 لسنة 2000** والقانون رقم **25 لسنة 1929** المعدل بالقانون **100 لسنة 1985**.

**أهم القواعد والإجراءات:**
1. **دعوى الخلع (المادة 20 من القانون 1 لسنة 2000):** تفتدي الزوجة نفسها برد مقدم الصداق الثابت بالوثيقة والتنازل عن جميع حقوقها المالية والشرعية (مؤخر، نفقة عدة، ونفقة متعة). الحكم الصادر بالخلع بات وغير قابل للطعن عليه بأي طريق.
2. **حقوق الصغار:** الخلع أو الطلاق لا يمس بحال حقوق الصغار في (النفقة الزوجية والتعليمية، أجر المسكن، والحضانة المقررة قانوناً حتى سن 15 سنة).
3. **مكتب تسوية المنازعات الأسرية:** تقديم طلب التسوية وجوبي قبل قيد الدعوى أمام محكمة الأسرة، وإلا قضي بعدم قبولها.`;
    }

    if (/إيجار|طرد|إخلاء|عقد إيجار/i.test(q)) {
      return `### ⚖️ التكييف القانوني لمنازعات عقود الإيجار في القانون المصري:

**التمييز التشريعي الجوهري:**
1. **العقود الخاضعة للقانون رقم 4 لسنة 1996 (الإيجار الجديد):** العقد شريعة المتعاقدين، تنتهي العلاقة الإيجارية بانتهاء المدة المحددة بالعقد دون حاجة إلى تنبيه بالإخلاء إذا نص العقد على ذلك، ويخضع لأحكام القانون المدني.
2. **العقود الخاضعة لقوانين الإيجار القديم (القانون 49 لسنة 1977 و136 لسنة 1981):** تمتد المدة بقوة القانون للمستأجر الأصلي ولمن يتوفر فيهم شرط الامتداد القانوني من الدرجة الأولى المقيمين إقامة هادئة ومستقرة.

**طريق الطرد السريع:**
إذا كان عقد الإيجار موثقاً ومذيلاً بالصيغة التنفيذية وفقاً للقانون رقم 137 لسنة 2006، يتم التنفيذ المباشر بالطرد بواسطة محضر التنفيذ دون ولوج طريق القضاء الموضوعي الطويل.`;
    }

    let statutoryBlock = '';
    if (statutoryContext.length > 0) {
      statutoryBlock = '\n\n**الأسانيد التشريعية ذات الصلة:**\n' + statutoryContext.map((s) => `- ${s}`).join('\n');
    }

    return `### ⚖️ الرأي الاستشاري للمستشار عطية الهلباوي:

بفحص الوقائع المعروضة في ضوء أحكام القانون المصري المعمول به:
1. **التكييف القانوني المبدئي:** الواقعة تطرح نزاعاً يدخل في اختصاص القضاء المصري المختص، ويتطلب التدقيق في السند الكتابي ومستندات الإثبات.
2. **المقتضى الإجرائي:** يلزم إعداد الملف وتجهيز صور بطاقات الأطراف والعقود أو الإيصالات أو المراسلات المتبادلة.
3. **الدفاع المقترح:** تأسيس الطلبات استناداً إلى مبدأ القوة الملزمة للاتفاق (المادة 147 مدني: العقد شريعة المتعاقدين) وحسن النية في تنفيذ الالتزامات (المادة 148 مدني).${statutoryBlock}

يسعدني تلقي أي مستندات أو استفسارات إضافية لصياغة المذكرة أو صحيفة الدعوى المناسبة لك فوراً.`;
  }

  private generateLegalDraft(query: string, ctx: LanguageContextReport): string {
    if (/بيع|شراء/i.test(query)) {
      return `### 📜 عقد بيع ابتدائي خالص الثمن (صياغة المستشار عطية الهلباوي)

إنه في يوم .......... الموافق ..... / ..... / 2026م، تحرر هذا العقد بين كل من:

**أولاً (الطرف الأول - البائع):**
السيد / .................................... مصري الجنسية، مسلم الديانة، بطاقة رقم قومي: (.......................) المقيم في: ....................................... (طرف أول - بائع).

**ثانياً (الطرف الثاني - المشتري):**
السيد / .................................... مصري الجنسية، مسلم الديانة، بطاقة رقم قومي: (.......................) المقيم في: ....................................... (طرف ثانٍ - مشترٍ).

**تمهيد:**
يمتلك الطرف الأول ما هو (العقار / الشقة / السيارة / المنقول) الكائن في ........................، ورغب الطرف الثاني في شرائه بعد المعاينة التامة النافية للجهالة شرعاً وقانوناً، فقد اتفقا على الآتي:

**البند الأول (التمهيد):**
يعتبر التمهيد السابق جزءاً لا يتجزأ من هذا العقد ومفسراً لبنوده.

**البند الثاني (المبيع):**
باع وأسقط وتنازل الطرف الأول بكافة الضمانات القانونية والفعلية إلى الطرف الثاني القابل لذلك ما هو: ...................................................

**البند الثالث (الثمن):**
تم هذا البيع نظير ثمن إجمالي قدره ........... جنيه مصري (فقط وقدره ...............................)، سددها الطرف الثاني بالكامل ليد الطرف الأول بمجلس هذا العقد، ويعتبر توقيع الطرف الأول بمثابة مخالصة نهائية تامة ونافية لأي مطالبة بالثمن.

**البند الرابع (أيلولة الملكية):**
يقر الطرف الأول بأن ملكية المبيع قد آلت إليه بطريق: (الشراء بموجب العقد المؤرخ ... / الميراث الشرعي عن المرحوم ...).

**البند الخامس (خلو المبيع من الحقوق العينية):**
يقر الطرف الأول بخلو المبيع من كافة الرهون والديون والاختصاصات والامتيازات وحقوق الارتفاق الظاهرة والخفية ومستحقات الضرائب والرسوم حتى تاريخ تحرير هذا العقد.

**البند السادس (المعاينة والاستلام):**
يقر الطرف الثاني بأنه عاين المبيع المعاينة التامة النافية للجهالة شرعاً وقانوناً وقبله بحالته الراهنة، واستلمه استلاماً فعلياً بمجلس هذا العقد.

**البند السابع (صحة التوقيع والتسجيل):**
يلتزم الطرف الأول بالحضور أمام المحكمة المختصة للإقرار بصحة توقيعه، أو أمام مأمورية الشهر العقاري لتوثيق عقد البيع النهائي وتقديم كافة المستندات اللازمة.

**البند الثامن (المحكمة المختصة):**
تختص محكمة .................... بنظر أي نزاع قد ينشأ بخصوص تفسير أو تنفيذ بنود هذا العقد.

**البند التاسع (النسخ):**
تحرر هذا العقد من نسختين أصليتين، بيد كل طرف نسخة للعمل بموجبها عند اللزوم.

**(الطرف الأول - البائع)**                                        **(الطرف الثاني - المشتري)**
الاسم: ....................                                        الاسم: ....................
التوقيع: ..................                                        التوقيع: ..................
الرقم القومي: ............                                        الرقم القومي: ............`;
    }

    return `### ⚖️ مذكرة بدفاع المستشار عطية الهلباوي

**محكمة:** ..........................................
**الدائرة:** ..........................................
**في القضية رقم:** .................... لسنة ....................
**المحدد لنظرها جلسة:** ..... / ..... / 2026م

**مقدمة من:** السيد / .................................... (صفته: ....................)
**ضــــــد:** السيد / .................................... (صفته: ....................)

**أولاً - الوقائع والأسانيد:**
تتلخص وقائع الدعوى في أن المدعي أقام دعواه بغية القضاء له بالطلبات الواردة بصحيفة افتتاح الدعوى، وحيث إن هذا الادعاء قد جانبه الصواب وخالف صحيح الواقع والقانون، فإن دفاع المدعى عليه يؤسس دفاعه على الآتي:

**ثانياً - الدفوع القانونية الجوهرية:**
1. **الدفع بعدم قبول الدعوى لرفعها من غير ذي صفة كاملة (المادة 3 مرافعات).**
2. **الدفع بعدم جواز نظر الدعوى لسابقة الفصل فيها بالدعوى رقم ....... لسنة ....... (المادة 101 إثبات).**
3. **الدفع بسقوط الحق بالتقادم الحولي أو الطويل بحسب الأحوال المنصوص عليها بالقانون المدني.**

**ثالثاً - الطلبات الختامية:**
يلتمس دفاع المدعى عليه من عدالة المحكمة الموقرة:
- **أصلياً:** القضاء برفض الدعوى وإلزام رافعها بالمصروفات ومقابل أتعاب المحاماة.
- **احتياطياً:** إحالة الدعوى للتحقيق أو لمكتب خبراء وزارة العدل لتحقيق عناصر النزاع وسماع شهود الطرفين.

وكيل المدعى عليه
**المستشار عطية الهلباوي**
المحامي بالنقض`;
  }

  // =========================================================================
  // GEMINI EXECUTION ENGINE
  // =========================================================================
  private async executeGeminiEngine(
    userInput: string,
    history: any[],
    attachments: Attachment[],
    mediaInsights: string,
    ctx: LanguageContextReport,
    intent: UserIntentReport,
    statutoryContext: string[]
  ): Promise<{ text: string }> {
    const apiKey = storage.getActiveGeminiKey();
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let personaInstructions = '';
    if (intent.classificationKey === 'GENERAL_CHAT') {
      personaInstructions = `أنت في وضع: المحاور العام (General Persona).
المستخدم يطرح سؤالاً عاماً أو اجتماعياً أو فكرياً أو شخصياً.
- تحاور بأسلوب ودي، لبق، راقٍ، وذكي.
- تفهم اللهجة المصرية وتجيب بها أو بالفصحى بسلاسة.
- لا تقحم مصطلحات أو نصوص القانون دون مبرر على الإطلاق، والتزم بالقاعدة: لا تحول كل رسالة إلى استشارة قانونية.`;
    } else if (intent.classificationKey === 'CONTRACT_DRAFTING') {
      personaInstructions = `أنت في وضع: مولد العقود والمذكرات القانونية (DynamicContractGenerator).
المستخدم يطلب صياغة عقد أو مذكرة قضائية أو صحيفة دعوى أو إنذار.
- قم بصياغة الوثيقة صياغة قضائية مصرية متكاملة، محكمة البنود، محددة الالتزامات والضمانات.
- أظهر أطراف العقد بدقة، وضع بنود التمهيد، الثمن، التسليم، الشرط الفاسخ الصريح، والاختصاص القضائي.`;
    } else {
      personaInstructions = `أنت في وضع: المستشار القانوني المصري (Egyptian Legal Counsel).
- قدم تكييفاً قانونياً دقيقاً للوقائع المعروضة وفقاً للتشريع المصري (مدني، جنائي، مرافعات، أسرة، تجاري، عمل).
- اذكر المواد القانونية الصحيحة وأحكام محكمة النقض دون اختلاق أو تزييف لأي أرقام طعون أو مواد غير مؤكدة.
- حلل الوقائع والأدلة وحدد الدفوع الجوهرية المؤثرة وخارطة الطريق الإجرائية.`;
    }

    const systemInstruction = `أنت العقل المركزي لمنظومة "المستشار عطية الهلباوي".
الاسم الوحيد المعتمد هو: "المستشار عطية الهلباوي".
${personaInstructions}`;

    const parts: any[] = [];

    // Multimodal attachments
    for (const att of attachments) {
      if (att.dataBase64 && att.type.startsWith('image/')) {
        parts.push({
          inlineData: {
            mimeType: att.type,
            data: att.dataBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
          },
        });
      }
    }

    let promptText = userInput;
    if (mediaInsights) {
      promptText = `[بيانات المرفقات]:\n${mediaInsights}\n\n[رسالة المستخدم]:\n${userInput}`;
    }
    parts.push({ text: promptText });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('انتهت مهلة استجابة محرك Gemini (تجاوزت 25 ثانية)')), 25000);
    });

    let response: any;
    try {
      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          systemInstruction,
        },
      });
      response = await Promise.race([generatePromise, timeoutPromise]);
    } catch (primaryErr: any) {
      const errMsg = String(primaryErr?.message || '');
      if (errMsg.includes('503') || errMsg.includes('high demand') || primaryErr?.status === 503) {
        const fallbackPromise = ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: { parts },
          config: {
            systemInstruction,
          },
        });
        response = await Promise.race([fallbackPromise, timeoutPromise]);
      } else {
        throw primaryErr;
      }
    }

    const responseText = response?.text || 'عذراً، لم أتمكن من الحصول على استجابة واضحة من المحرك.';
    return { text: responseText };
  }

  // --- Legal Tags Helper ---
  private extractLegalTags(text: string): string[] {
    const tags = new Set<string>();
    if (/مدني|عقد|تعويض|ملكية/i.test(text)) tags.add('قانون مدني');
    if (/جنائي|جنحة|جناية|حبس|شيك|إيصال/i.test(text)) tags.add('قانون جنائي');
    if (/مرافعات|اختصاص|إعلان|دفوع|بطلان/i.test(text)) tags.add('قانون المرافعات');
    if (/طلاق|خلع|نفقة|حضانة|أسرة/i.test(text)) tags.add('أحوال شخصية');
    if (/تجاري|شركة|إفلاس|كمبيالة/i.test(text)) tags.add('قانون تجاري');
    if (/عمل|عمال|فصل تعسفي/i.test(text)) tags.add('قانون العمل');
    if (/مجلس دولة|إداري|قرار إداري/i.test(text)) tags.add('قضاء إداري');
    if (tags.size === 0) tags.add('استشارة عامة');
    return Array.from(tags);
  }
}

// Instance singleton
export const centralBrainService = new CentralBrainService();
