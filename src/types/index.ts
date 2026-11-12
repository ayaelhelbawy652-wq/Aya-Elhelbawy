/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EngineMode = 'AUTOMATIC' | 'ATTYA_LEGAL_MIND' | 'GEMINI';

export type UserRole = 'ADMIN' | 'LAWYER' | 'CONSULTANT' | 'STAFF' | 'CLIENT';

export interface AuthSession {
  token: string;
  role: UserRole;
  isDefaultPin: boolean;
  username: string;
  expiresAt: number;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  dataBase64?: string;
  extractedText?: string;
  summary?: string;
  parsedMetadata?: {
    parties?: string[];
    dates?: string[];
    amounts?: string[];
    clauses?: string[];
    missingElements?: string[];
    contradictions?: string[];
  };
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant';
  content: string;
  engineUsed: 'ATTYA LEGAL MIND' | 'GEMINI 3.8 FLASH' | 'AUTOMATIC';
  timestamp: number;
  attachments?: Attachment[];
  audioUrl?: string;
  transcription?: string;
  caseId?: string;
  legalTags?: string[];
  activePersona?: 'المحاور العام' | 'المستشار القانوني المصري' | 'مولد العقود والمذكرات';
  intentSummary?: string;
  isVerified?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  caseId?: string;
  category: 'general' | 'legal' | 'contract' | 'case_analysis' | 'document_review';
  pinned?: boolean;
  messageCount: number;
}

// 15 Law Practice Management Entities
export interface Client {
  id: string;
  name: string;
  nationalId?: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  caseCount?: number;
  createdAt: number;
}

export interface Opponent {
  id: string;
  name: string;
  lawyerName?: string;
  lawyerPhone?: string;
  capacity: string; // e.g. مدعى عليه، طاعن، مستأنف
  address?: string;
  notes?: string;
}

export interface LegalCase {
  id: string;
  caseNumber: string;
  year: string;
  court: string;
  circuit: string;
  caseType: 'مدني' | 'جنائي' | 'أسرة' | 'تجاري' | 'عمال' | 'إداري مجلس دولة' | 'مستعجل';
  clientId: string;
  clientName: string;
  opponentId?: string;
  opponentName: string;
  status: 'قيد التداول' | 'مؤجلة للحكم' | 'محكوم فيها' | 'استئناف' | 'طعن بالنقض' | 'مغلقة';
  claimSubject: string; // موضوع الدعوى
  requestsSummary: string; // طلبات الموكل
  assignedLawyer: string;
  totalAgreedFees: number;
  paidFees: number;
  createdAt: number;
  nextSessionDate?: string;
  notes?: string;
}

export interface CourtSession {
  id: string;
  caseId: string;
  caseNumber: string;
  sessionDate: string;
  courtName: string;
  circuit: string;
  decisionRequested: string; // المطلوب بالجلسة (تقديم مذكرات، مستندات، خبير)
  decisionResult?: string; // قرار المحكمة
  attendanceLawyer: string;
  status: 'قادمة' | 'انعقدت' | 'مؤجلة';
}

export interface LegalDocument {
  id: string;
  caseId?: string;
  title: string;
  type: 'مذكرة دفاع' | 'صحيفة دعوى' | 'عقد' | 'إنذار رسمي' | 'شكوى' | 'تقرير استشاري' | 'توكيل';
  content: string;
  parties: { name: string; role: string }[];
  status: 'مسودة' | 'معتمد' | 'مقدم بالمحكمة';
  createdAt: number;
  updatedAt: number;
}

export interface OfficeTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  assignedTo: string;
  priority: 'عاجل جداً' | 'متوسط' | 'عادي';
  status: 'معلق' | 'قيد التنفيذ' | 'مكتمل';
  caseId?: string;
}

export interface FinancialRecord {
  id: string;
  type: 'أتعاب مقبوضة' | 'مصروفات قضائية' | 'رسوم محكمة' | 'انتقالات وأمانات' | 'نثريات';
  caseId?: string;
  clientName?: string;
  amount: number;
  date: string;
  receiptNumber?: string;
  paymentMethod: 'نقدي' | 'تحويل بنكي' | 'فودافون كاش / إنستاباي';
  notes?: string;
}

export interface LegalDictionaryEntry {
  term: string;
  linguisticDefinition: string;
  legalDefinition: string;
  jurisprudenceNote?: string;
  statutoryBasis?: string; // السند التشريعي
  cassationPrinciple?: string; // مبدأ محكمة النقض
  practicalExample?: string;
  category: 'مدني' | 'جنائي' | 'مرافعات' | 'أسرة' | 'تجاري' | 'إجراءات';
}

export interface CashSubscription {
  id: string;
  payerName: string;
  phone: string;
  amount: number;
  referenceNumber: string;
  transferDate: string;
  receiptImageBase64?: string;
  targetWallet: string; // 01153747612
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  reviewedAt?: number;
}

export interface GeminiConfigStatus {
  isConfigured: boolean;
  hasCustomKey: boolean;
  activeModel: string;
  totalTokensUsed: number;
  lastTestStatus: 'SUCCESS' | 'FAILED' | 'UNTESTED';
  lastTestedAt?: number;
  errorMessage?: string;
}

export interface TestResultItem {
  id: number;
  name: string;
  inputs: string;
  expectedResult: string;
  actualResult: string;
  executionEvidence: string;
  status: 'PLANNED' | 'IMPLEMENTED' | 'TESTED' | 'FAILED' | 'BLOCKED';
}
