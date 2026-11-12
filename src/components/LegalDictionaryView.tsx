/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Scale, FileText, ChevronRight, Bookmark } from 'lucide-react';
import { LegalDictionaryEntry } from '../types/index.ts';

export const LegalDictionaryView: React.FC = () => {
  const [entries, setEntries] = useState<LegalDictionaryEntry[]>([]);
  const [query, setQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<LegalDictionaryEntry | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchDictionary();
  }, [query]);

  const fetchDictionary = async () => {
    try {
      const url = query ? `/api/dictionary?q=${encodeURIComponent(query)}` : '/api/dictionary';
      const res = await fetch(url);
      const data: LegalDictionaryEntry[] = await res.json();
      setEntries(data);
      if (data.length > 0 && !selectedEntry) {
        setSelectedEntry(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const categories = [
    { id: 'all', name: 'كافة التصنيفات' },
    { id: 'مدني', name: 'القانون المدني' },
    { id: 'جنائي', name: 'القانون الجنائي' },
    { id: 'مرافعات', name: 'المرافعات والإثبات' },
    { id: 'أسرة', name: 'الأحوال الشخصية' },
    { id: 'تجاري', name: 'القانون التجاري' },
  ];

  const filteredEntries = entries.filter((e) =>
    selectedCategory === 'all' ? true : e.category === selectedCategory
  );

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#070d18] text-slate-100 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-amber-500/20 text-right">
        <h2 className="text-xl sm:text-2xl font-bold text-amber-100 font-['Cairo',sans-serif] flex items-center justify-end gap-2.5">
          <span>معجم ومنظومة المعرفة القانونية المصرية</span>
          <BookOpen className="w-6 h-6 text-amber-400" />
        </h2>
        <p className="text-xs text-amber-400/80 mt-1">
          مصطلحات قضائية موثقة، تعريفات لغوية وقانونية وفقهية، أسانيد تشريعية، وتطبيقات محكمة النقض المصرية
        </p>
      </div>

      {/* Search Bar & Categories */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مصطلح قانوني، قاعدة فقهية، أو مادة تشريعية..."
            className="w-full bg-[#0a1424] border border-amber-500/30 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 text-right"
          />
          <Search className="w-5 h-5 text-amber-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-[#0a1424] border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Split View: List on Right, Details on Left */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* List of Terms (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0a1424] border border-amber-500/20 rounded-2xl p-3 border-royal-gold space-y-2 max-h-[70vh] overflow-y-auto">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              لا توجد مصطلحات مطابقة للبحث
            </div>
          ) : (
            filteredEntries.map((item) => (
              <div
                key={item.term}
                onClick={() => setSelectedEntry(item)}
                className={`p-3.5 rounded-xl cursor-pointer text-right transition-all ${
                  selectedEntry?.term === item.term
                    ? 'bg-amber-500/15 border border-amber-500/50 text-amber-200'
                    : 'bg-[#070d18] border border-slate-800 hover:border-amber-500/30 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-amber-400 border border-amber-500/20">
                    {item.category}
                  </span>
                  <span className="font-bold text-sm text-amber-100">{item.term}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {item.legalDefinition}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Selected Term Full Card (8 Cols) */}
        <div className="lg:col-span-8">
          {selectedEntry ? (
            <div className="bg-[#0a1424] border-2 border-royal-double border-amber-500/30 rounded-2xl p-6 sm:p-8 text-right space-y-6">
              {/* Term Header */}
              <div className="border-b border-amber-500/20 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                    فرع: {selectedEntry.category}
                  </span>
                  <h3 className="text-2xl font-bold text-amber-100 font-['Cairo',sans-serif]">
                    {selectedEntry.term}
                  </h3>
                </div>
              </div>

              {/* Definitions Grid */}
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
                <div className="bg-[#070d18] border border-slate-800 rounded-xl p-4">
                  <h4 className="font-bold text-amber-300 mb-1 text-xs">📖 التعريف اللغوي:</h4>
                  <p className="text-slate-200">{selectedEntry.linguisticDefinition}</p>
                </div>

                <div className="bg-[#070d18] border border-slate-800 rounded-xl p-4">
                  <h4 className="font-bold text-amber-300 mb-1 text-xs">⚖️ التعريف القانوني والاصطلاحي:</h4>
                  <p className="text-slate-200">{selectedEntry.legalDefinition}</p>
                </div>

                {selectedEntry.jurisprudenceNote && (
                  <div className="bg-[#070d18] border border-slate-800 rounded-xl p-4">
                    <h4 className="font-bold text-amber-300 mb-1 text-xs">🏛️ الملاحظة الفقهية والتكييف:</h4>
                    <p className="text-slate-200">{selectedEntry.jurisprudenceNote}</p>
                  </div>
                )}

                {selectedEntry.statutoryBasis && (
                  <div className="bg-[#070d18] border border-amber-500/20 rounded-xl p-4">
                    <h4 className="font-bold text-amber-300 mb-1 text-xs">📜 السند التشريعي في القانون المصري:</h4>
                    <p className="text-amber-100 font-medium">{selectedEntry.statutoryBasis}</p>
                  </div>
                )}

                {selectedEntry.cassationPrinciple && (
                  <div className="bg-[#070d18] border border-amber-500/20 rounded-xl p-4">
                    <h4 className="font-bold text-amber-300 mb-1 text-xs">⚖️ مبدأ وتطبيق محكمة النقض المصرية:</h4>
                    <p className="text-slate-200 italic">{selectedEntry.cassationPrinciple}</p>
                  </div>
                )}

                {selectedEntry.practicalExample && (
                  <div className="bg-[#070d18] border border-slate-800 rounded-xl p-4">
                    <h4 className="font-bold text-amber-300 mb-1 text-xs">💡 مثال عملي من واقع العمل القضائي:</h4>
                    <p className="text-slate-200">{selectedEntry.practicalExample}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#0a1424] border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              اختر مصطلحاً من القائمة لاستعراض تفاصيله
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
