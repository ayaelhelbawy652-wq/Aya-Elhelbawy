/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Smartphone,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  KeyRound,
  RefreshCw,
  Upload,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { CashSubscription, GeminiConfigStatus } from '../types/index.ts';
import { DocumentExporter } from '../utils/exporter.ts';

export const SubscriptionView: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<CashSubscription[]>([]);
  const [geminiStatus, setGeminiStatus] = useState<GeminiConfigStatus | null>(null);

  // Transfer form state
  const [payerName, setPayerName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('500');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [subSuccessMsg, setSubSuccessMsg] = useState('');
  const [subErrorMsg, setSubErrorMsg] = useState('');

  // Gemini Key state
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [testingKey, setTestingKey] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState<{ success: boolean; msg: string } | null>(null);
  const [copiedWallet, setCopiedWallet] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
    fetchGeminiConfig();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch('/api/subscriptions');
      const data = await res.json();
      setSubscriptions(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGeminiConfig = async () => {
    try {
      const res = await fetch('/api/gemini/config');
      const data = await res.json();
      setGeminiStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyWallet = () => {
    DocumentExporter.copyToClipboard('01153747612');
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubSuccessMsg('');
    setSubErrorMsg('');

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payerName,
          phone,
          amount: Number(amount),
          referenceNumber,
          transferDate,
          receiptImageBase64: receiptImage || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubSuccessMsg('تم تسجيل طلب التحويل بنجاح برقم إشعار مؤقت! ستتم المراجعة والاعتماد فوراً.');
        setPayerName('');
        setPhone('');
        setReferenceNumber('');
        setReceiptImage('');
        fetchSubscriptions();
      } else {
        setSubErrorMsg(data.error || 'فشل إرسال الطلب');
      }
    } catch (err: any) {
      setSubErrorMsg('خطأ بالخادم: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await fetch(`/api/subscriptions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: `تم التحديث بواسطة الإدارة في ${new Date().toLocaleDateString('ar-EG')}` }),
      });
      fetchSubscriptions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setTestingKey(true);
    setKeyFeedback(null);

    try {
      const res = await fetch('/api/gemini/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() }),
      });
      const data = await res.json();
      setKeyFeedback({ success: data.success, msg: data.message });
      setGeminiStatus(data.status);
      if (data.success) {
        setApiKeyInput('');
      }
    } catch (err: any) {
      setKeyFeedback({ success: false, msg: 'فشل فحص المفتاح: ' + err.message });
    } finally {
      setTestingKey(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#070d18] text-slate-100 p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="border-b border-amber-500/20 pb-4 text-right">
        <h2 className="text-xl sm:text-2xl font-bold text-amber-100 font-['Cairo',sans-serif]">
          نظام الاشتراك النقدي وشحن حصة محرك Gemini
        </h2>
        <p className="text-xs text-amber-400/80 mt-1">
          إدارة اشتراك العضوية وتأكيد التحويلات ومتابعة حصة الاستهلاك الذكية في خادم آمن
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SECTION 1: CASH SUBSCRIPTION (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Instructions Box */}
          <div className="bg-[#0a1424] border-2 border-royal-double border-amber-500/30 rounded-2xl p-6 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                قيمة الاشتراك: 500 جنيه مصري
              </span>
              <h3 className="text-lg font-bold text-amber-200 font-['Cairo',sans-serif] flex items-center gap-2">
                <span>الاشتراك النقدي الرسمي</span>
                <Smartphone className="w-5 h-5 text-amber-400" />
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              لتفعيل اشتراك المنظومة الذكية والاستفادة من خدمات المستشار عطية الهلباوي الكاملة، يرجى تحويل مبلغ <strong className="text-amber-300">500 جنيه مصري</strong> إلى المحفظة الإلكترونية المعتمدة:
            </p>

            {/* Wallet Box */}
            <div className="bg-[#070d18] border border-amber-500/40 rounded-xl p-4 flex items-center justify-between">
              <button
                onClick={handleCopyWallet}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedWallet ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الرقم</span>
                  </>
                )}
              </button>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">رقم المحفظة (فودافون كاش / إنستاباي):</span>
                <span className="text-xl font-bold font-mono text-amber-200 tracking-wider">
                  01153747612
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              * بعد إتمام التحويل، يرجى تسجيل بيانات العملية أدناه لتدقيق الإيصال وتفعيل الحساب.
            </p>
          </div>

          {/* Submission Form */}
          <div className="bg-[#0a1424] border border-amber-500/20 rounded-2xl p-6 text-right border-royal-gold">
            <h4 className="text-sm font-bold text-amber-200 mb-4">تسجيل بيانات التحويل لتأكيد الاشتراك</h4>

            <form onSubmit={handleSubmitSubscription} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">اسم صاحب الحساب / المحول:</label>
                  <input
                    type="text"
                    required
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="الاسم الثلاثي أو اسم المكتب"
                    className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">رقم الهاتف المحول منه:</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01xxxxxxxxx"
                    className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">الرقم المرجعي للتحويل (Reference No):</label>
                  <input
                    type="text"
                    required
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="رقم العملية بالإشعار"
                    className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">المبلغ المسدد (ج.م):</label>
                  <input
                    type="number"
                    value={amount}
                    readOnly
                    className="w-full bg-[#070d18] border border-slate-700 rounded-lg p-2.5 text-amber-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">صورة إيصال التحويل (اختياري):</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 border border-dashed border-amber-500/30 rounded-lg p-3 text-center cursor-pointer hover:border-amber-400 text-slate-400 bg-[#070d18]">
                    <Upload className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    <span>{receiptImage ? 'تم اختيار صورة الإيصال بنجاح' : 'اضغط لرفع لقطة شاشة الإيصال'}</span>
                    <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {subSuccessMsg && (
                <p className="p-2.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{subSuccessMsg}</span>
                </p>
              )}
              {subErrorMsg && (
                <p className="p-2.5 rounded bg-red-950 text-red-300 border border-red-800 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{subErrorMsg}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold rounded-lg hover:brightness-110 cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'جاري الإرسال والتسجيل...' : 'إرسال طلب الاشتراك للمراجعة'}
              </button>
            </form>
          </div>

          {/* Subscriptions Table / Review Log */}
          <div className="bg-[#0a1424] border border-amber-500/20 rounded-2xl p-5 text-right space-y-3">
            <h4 className="text-xs font-bold text-amber-200">سجل طلبات الاشتراكات وحالتها</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-[#070d18] text-amber-300 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">المحول</th>
                    <th className="p-2.5">الهاتف</th>
                    <th className="p-2.5">المرجع</th>
                    <th className="p-2.5">المبلغ</th>
                    <th className="p-2.5">الحالة</th>
                    <th className="p-2.5">الإجراء الإداري</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {subscriptions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-semibold text-slate-100">{s.payerName}</td>
                      <td className="p-2.5 font-mono text-slate-400">{s.phone}</td>
                      <td className="p-2.5 font-mono text-slate-400">{s.referenceNumber}</td>
                      <td className="p-2.5 font-mono text-emerald-400">{s.amount} ج.م</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === 'APPROVED'
                              ? 'bg-emerald-950 text-emerald-300'
                              : s.status === 'REJECTED'
                              ? 'bg-red-950 text-red-300'
                              : 'bg-amber-950 text-amber-300'
                          }`}
                        >
                          {s.status === 'APPROVED' ? 'معتمد' : s.status === 'REJECTED' ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </td>
                      <td className="p-2.5">
                        {s.status === 'PENDING' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateStatus(s.id, 'APPROVED')}
                              className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] cursor-pointer"
                            >
                              اعتماد
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(s.id, 'REJECTED')}
                              className="px-2 py-0.5 bg-red-800 hover:bg-red-700 text-white rounded text-[10px] cursor-pointer"
                            >
                              رفض
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 2: GEMINI API QUOTA & SECRETS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0a1424] border-2 border-royal-double border-amber-500/30 rounded-2xl p-6 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                Server-Side Only
              </span>
              <h3 className="text-base font-bold text-amber-200 font-['Cairo',sans-serif] flex items-center gap-2">
                <span>شحن حصة Gemini وإدارتها</span>
                <KeyRound className="w-5 h-5 text-amber-400" />
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              يتم حفظ واختبار مفاتيح Gemini API في الخادم حصراً، ولا يتم كشفها نهائياً لمتصفح المستخدم لضمان أعلى معايير الحماية والأمان.
            </p>

            {/* Current Engine Status */}
            <div className="bg-[#070d18] border border-slate-800 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">حالة تكوين المفتاح:</span>
                <span className={`font-bold ${geminiStatus?.isConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {geminiStatus?.isConfigured ? 'مفعل وجاهز بالخادم' : 'غير مهيأ بعد'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">النموذج النشط:</span>
                <span className="font-mono text-amber-300">gemini-3.8-flash</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">حالة آخر فحص اتصال:</span>
                <span className={`font-bold ${
                  geminiStatus?.lastTestStatus === 'SUCCESS'
                    ? 'text-emerald-400'
                    : geminiStatus?.lastTestStatus === 'FAILED'
                    ? 'text-red-400'
                    : 'text-slate-400'
                }`}>
                  {geminiStatus?.lastTestStatus || 'لم يُفحص'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">إجمالي الطلبات المسجلة:</span>
                <span className="font-mono text-slate-200">{geminiStatus?.totalTokensUsed || 0}</span>
              </div>
            </div>

            {/* Setup / Change Key Form */}
            <form onSubmit={handleSaveGeminiKey} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  تحديث مفتاح Gemini API المخصص:
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-xs text-amber-200 font-mono"
                />
              </div>

              {keyFeedback && (
                <p className={`p-2 rounded text-xs ${keyFeedback.success ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}`}>
                  {keyFeedback.msg}
                </p>
              )}

              <button
                type="submit"
                disabled={testingKey || !apiKeyInput.trim()}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {testingKey ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري اختبار المفتاح في الخادم...</span>
                  </>
                ) : (
                  <span>حفظ وفحص الاتصال بالمحرك</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
