/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KeyRound, ShieldCheck, X } from 'lucide-react';

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePinModal: React.FC<ChangePinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPin !== confirmPin) {
      setError('الرمز الجديد وتأكيده غير متطابقين');
      return;
    }
    if (newPin.length < 6) {
      setError('يجب ألا يقل الرمز الجديد عن 6 أرقام');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPin, newPin }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'فشل تغيير الرمز');
      }
    } catch (err: any) {
      setError('خطأ بالخادم: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-[#0a1424] border-2 border-royal-double border-amber-500/40 rounded-2xl p-6 text-right">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-200">تغيير رمز المرور الرئيسي</h3>
            <p className="text-xs text-slate-400">تحديث رمز الإعداد الأولي لتأمين بيانات المكتب</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">الرمز الحالي (000000 إن لم يغير سابقاً):</label>
            <input
              type="password"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-center text-amber-200 font-mono tracking-widest focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">الرمز السري الجديد (6 أرقام على الأقل):</label>
            <input
              type="password"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-center text-amber-200 font-mono tracking-widest focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">تأكيد الرمز الجديد:</label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-center text-amber-200 font-mono tracking-widest focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          {error && <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded">{error}</p>}
          {successMsg && <p className="text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" />{successMsg}</p>}

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold rounded-lg hover:brightness-110 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'جاري التحديث...' : 'حفظ الرمز وتأمين المنظومة'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
