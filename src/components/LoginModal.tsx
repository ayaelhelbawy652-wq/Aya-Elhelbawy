/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, CheckCircle2, Scale } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onSuccess: (token: string, isDefaultPin: boolean) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setError('يرجى إدخال رمز الدخول');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();

      if (data.success) {
        onSuccess(data.token, data.isDefaultPin);
      } else {
        setError(data.message || 'رمز الدخول غير صحيح');
      }
    } catch (err: any) {
      setError('تعذر الاتصال بالخادم: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-[#0a1424] border-2 border-[#d4af37]/60 rounded-2xl shadow-2xl p-8 text-center border-royal-double">
        {/* Crest */}
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-[#aa820a] to-[#d4af37] p-0.5 mb-5 shadow-lg shadow-amber-500/20">
          <div className="w-full h-full rounded-full bg-[#070d18] flex items-center justify-center">
            <Scale className="w-8 h-8 text-[#d4af37]" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-amber-100 tracking-wide mb-1 font-['Cairo',sans-serif]">
          المستشار عطية الهلباوي
        </h2>
        <p className="text-xs text-amber-400/80 mb-6 font-medium">
          المنصة الذكية الملكية — مصادقة الدخول الآمن
        </p>

        <div className="bg-[#101b2f] border border-amber-500/20 rounded-xl p-3.5 mb-6 text-right text-xs text-slate-300">
          <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>رمز الدخول الأولي للمنظومة:</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            الرمز المعتمد لتهيئة النظام هو <span className="font-mono text-amber-300 font-bold px-1.5 py-0.5 bg-black/40 rounded border border-amber-500/30">000000</span>. سيُطلب منك فور الدخول تغييره لضمان حماية بيانات الموكلين والقضايا.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-right">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              أدخل رمز المرور السري:
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={20}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#070d18] border border-amber-500/30 rounded-xl px-4 py-3 text-center text-xl tracking-[0.3em] text-amber-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                autoFocus
              />
              <Lock className="w-4 h-4 text-amber-500/40 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 text-right bg-red-950/40 border border-red-800/40 p-2.5 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-gradient-to-r from-[#aa820a] via-[#d4af37] to-[#aa820a] text-slate-950 font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'جاري التحقق...' : 'دخول المنصة الملكية'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
          <span>جلسة مشفرة ومؤمنة في خادم مكتب الأستاذ عطية الهلباوي</span>
        </div>
      </div>
    </div>
  );
};
