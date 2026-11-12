/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Scale, MessageSquare, Briefcase, BookOpen, CreditCard, CheckCircle, ShieldAlert, KeyRound, LogOut } from 'lucide-react';

export type ActiveTab = 'chat' | 'office' | 'dictionary' | 'subscription' | 'tests';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDefaultPin: boolean;
  onOpenChangePin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDefaultPin,
  onOpenChangePin,
  onLogout,
}) => {
  const [bannerDismissed, setBannerDismissed] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#070d18]/95 backdrop-blur-md border-b border-amber-500/30 shadow-lg">
      {/* Top Banner warning if default PIN is active */}
      {isDefaultPin && !bannerDismissed && (
        <div className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-1.5 text-center text-xs text-amber-200 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>تنبيه أمني: المنظومة تعمل برمز الإعداد الأولي (000000). يرجى تغييره لحماية أسرار الموكلين.</span>
          <button
            onClick={onOpenChangePin}
            className="underline font-bold text-amber-300 hover:text-white cursor-pointer mr-2"
          >
            تغيير الرمز الآن
          </button>
          <button
            onClick={() => setBannerDismissed(true)}
            title="إخفاء مؤقت"
            className="mr-3 text-amber-400/70 hover:text-white text-xs cursor-pointer p-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Bar Contract (3 zones, whitespace-nowrap, no mechanical clutter) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/10">
            <Scale className="w-5 h-5" />
          </div>
          <div className="text-right">
            <span className="text-lg font-bold tracking-tight text-amber-100 whitespace-nowrap block font-['Cairo',sans-serif]">
              المستشار عطية الهلباوي
            </span>
            <span className="text-[10px] text-amber-400/80 font-medium tracking-wide block -mt-1">
              المنصة الذكية الملكية
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single line, clean active indicators) */}
        <nav className="hidden md:flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>غرفة المحادثة الذكية</span>
          </button>

          <button
            onClick={() => setActiveTab('office')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'office'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>إدارة مكتب المحاماة</span>
          </button>

          <button
            onClick={() => setActiveTab('dictionary')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'dictionary'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>معجم القانون المصري</span>
          </button>

          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'subscription'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>الاشتراك وشحن Gemini</span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'tests'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>الاختبارات الـ 30 الإلزامية</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action / Security Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenChangePin}
            title="تغيير رمز المرور"
            className="p-2 rounded-lg bg-slate-800/80 border border-amber-500/20 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
          </button>
          <button
            onClick={onLogout}
            title="تسجيل الخروج"
            className="p-2 rounded-lg bg-red-950/40 border border-red-800/30 text-red-300 hover:bg-red-900/50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar for smaller screens */}
      <div className="md:hidden border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around overflow-x-auto text-[11px] gap-1">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'chat' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
          }`}
        >
          المحادثة
        </button>
        <button
          onClick={() => setActiveTab('office')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'office' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
          }`}
        >
          المكتب
        </button>
        <button
          onClick={() => setActiveTab('dictionary')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'dictionary' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
          }`}
        >
          المعجم
        </button>
        <button
          onClick={() => setActiveTab('subscription')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'subscription' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
          }`}
        >
          الاشتراك
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-2.5 py-1 rounded font-medium whitespace-nowrap ${
            activeTab === 'tests' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
          }`}
        >
          الاختبارات
        </button>
      </div>
    </header>
  );
};
