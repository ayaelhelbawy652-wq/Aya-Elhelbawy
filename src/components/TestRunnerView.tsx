/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Play,
  Scale,
  FileCheck2,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { TestResultItem } from '../types/index.ts';
import { DocumentExporter } from '../utils/exporter.ts';

export const TestRunnerView: React.FC = () => {
  const [tests, setTests] = useState<TestResultItem[]>([]);
  const [summary, setSummary] = useState({ total: 30, tested: 0, failed: 0 });
  const [running, setRunning] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'TESTED' | 'FAILED'>('ALL');

  useEffect(() => {
    runAllTests();
  }, []);

  const runAllTests = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/tests/run-all');
      const data = await res.json();
      setTests(data.tests || []);
      setSummary(data.summary || { total: 30, tested: 0, failed: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  const handleExportTestReport = () => {
    let reportContent = `تقرير الفحص والاختبارات الإلزامية الثلاثين لمنظومة المستشار عطية الهلباوي\n`;
    reportContent += `تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG')}\n`;
    reportContent += `إجمالي الاختبارات: ${summary.total} | الناجحة والموثقة (TESTED): ${summary.tested} | الفاشلة: ${summary.failed}\n`;
    reportContent += `========================================================================\n\n`;

    tests.forEach((t) => {
      reportContent += `[اختبار #${t.id}]: ${t.name}\n`;
      reportContent += `- المدخلات: ${t.inputs}\n`;
      reportContent += `- النتيجة المتوقعة: ${t.expectedResult}\n`;
      reportContent += `- النتيجة الفعلية: ${t.actualResult}\n`;
      reportContent += `- دليل التنفيذ: ${t.executionEvidence}\n`;
      reportContent += `- الحالة النهائية: [${t.status}]\n\n`;
    });

    DocumentExporter.exportTxt(reportContent, 'تقرير_الاختبارات_الهندسية_المستشار_عطية_الهلباوي.txt');
  };

  const filteredTests = tests.filter((t) => {
    if (selectedFilter === 'ALL') return true;
    return t.status === selectedFilter;
  });

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#070d18] text-slate-100 p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-amber-100 font-['Cairo',sans-serif] flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-amber-400" />
            <span>مصفوفة الاختبارات الإلزامية الثلاثين (30 Test Suite)</span>
          </h2>
          <p className="text-xs text-amber-400/80 mt-1">
            توثيق وتنفيذ الاختبارات الهندسية الشاملة المقررة في أمر التكليف النهائي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runAllTests}
            disabled={running}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 hover:brightness-110 cursor-pointer shadow-md disabled:opacity-50"
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري التنفيذ والفحص...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>إعادة تشغيل كافة الاختبارات</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportTestReport}
            className="px-3.5 py-2 bg-[#0a1424] border border-amber-500/40 text-amber-300 hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>تصدير تقرير الاختبارات (TXT)</span>
          </button>
        </div>
      </div>

      {/* Summary Scoreboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0a1424] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-3xl font-bold font-mono text-amber-200">{summary.total}</span>
          <div>
            <span className="text-xs text-slate-400 block">إجمالي الاختبارات المقررة</span>
            <span className="text-[10px] text-amber-400">حسب أمر التكليف الهندسي</span>
          </div>
        </div>

        <div className="bg-[#0a1424] border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-3xl font-bold font-mono text-emerald-400">{summary.tested}</span>
          <div>
            <span className="text-xs text-slate-400 block">اختبارات منفذة ومجتازة</span>
            <span className="text-[10px] text-emerald-400">TESTED & CERTIFIED</span>
          </div>
        </div>

        <div className="bg-[#0a1424] border border-red-500/30 rounded-2xl p-4 flex items-center justify-between">
          <span className="text-3xl font-bold font-mono text-red-400">{summary.failed}</span>
          <div>
            <span className="text-xs text-slate-400 block">اختبارات متعثرة / متوقفة</span>
            <span className="text-[10px] text-red-400">FAILED</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setSelectedFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            selectedFilter === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-[#0a1424] text-slate-300'
          }`}
        >
          كافة الاختبارات ({tests.length})
        </button>
        <button
          onClick={() => setSelectedFilter('TESTED')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            selectedFilter === 'TESTED' ? 'bg-emerald-600 text-white font-bold' : 'bg-[#0a1424] text-slate-300'
          }`}
        >
          الناجحة TESTED ({summary.tested})
        </button>
        {summary.failed > 0 && (
          <button
            onClick={() => setSelectedFilter('FAILED')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedFilter === 'FAILED' ? 'bg-red-600 text-white font-bold' : 'bg-[#0a1424] text-slate-300'
            }`}
          >
            المتعثرة FAILED ({summary.failed})
          </button>
        )}
      </div>

      {/* Test Items Table */}
      <div className="bg-[#0a1424] border border-amber-500/30 rounded-2xl overflow-hidden border-royal-double">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#070d18] text-amber-300 border-b border-amber-500/20">
              <tr>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">اسم الاختبار الإلزامي</th>
                <th className="p-3">المدخلات</th>
                <th className="p-3">النتيجة المتوقعة</th>
                <th className="p-3">النتيجة الفعلية المحققة</th>
                <th className="p-3">دليل التنفيذ</th>
                <th className="p-3 w-28 text-center">الحالة النهائية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTests.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="p-3 text-center font-mono font-bold text-amber-400">{t.id}</td>
                  <td className="p-3 font-semibold text-slate-100">{t.name}</td>
                  <td className="p-3 text-slate-300 font-mono text-[11px] max-w-[140px] truncate">{t.inputs}</td>
                  <td className="p-3 text-slate-300 text-[11px] max-w-[180px]">{t.expectedResult}</td>
                  <td className="p-3 text-emerald-300 text-[11px] max-w-[180px]">{t.actualResult}</td>
                  <td className="p-3 text-slate-400 font-mono text-[10px] max-w-[140px] truncate">{t.executionEvidence}</td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                        t.status === 'TESTED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {t.status === 'TESTED' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>TESTED</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-red-400" />
                          <span>FAILED</span>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
