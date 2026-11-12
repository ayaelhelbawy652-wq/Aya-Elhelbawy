/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Calendar,
  FileText,
  DollarSign,
  CheckSquare,
  Plus,
  Scale,
  Clock,
  Printer,
  FileDown,
  Building2,
  FolderArchive,
  Search,
} from 'lucide-react';
import {
  Client,
  Opponent,
  LegalCase,
  CourtSession,
  LegalDocument,
  OfficeTask,
  FinancialRecord,
} from '../types/index.ts';
import { DocumentExporter } from '../utils/exporter.ts';

type OfficeSubTab = 'overview' | 'clients' | 'cases' | 'sessions' | 'documents' | 'tasks' | 'financials' | 'archive';

export const OfficeSuite: React.FC = () => {
  const [subTab, setSubTab] = useState<OfficeSubTab>('overview');
  const [stats, setStats] = useState<any>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [sessions, setSessions] = useState<CourtSession[]>([]);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [tasks, setTasks] = useState<OfficeTask[]>([]);
  const [financials, setFinancials] = useState<FinancialRecord[]>([]);

  // Modal states for creating new records
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddCase, setShowAddCase] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  // Form states
  const [clientForm, setClientForm] = useState({ name: '', phone: '', nationalId: '', address: '', notes: '' });
  const [caseForm, setCaseForm] = useState({
    caseNumber: '',
    year: '2026',
    court: 'محكمة شمال الجيزة الابتدائية',
    circuit: 'الدائرة 7 مدني',
    caseType: 'مدني' as LegalCase['caseType'],
    clientId: '',
    opponentName: '',
    claimSubject: '',
    requestsSummary: '',
    totalAgreedFees: 50000,
    paidFees: 20000,
    assignedLawyer: 'الأستاذ عطية الهلباوي',
  });
  const [sessionForm, setSessionForm] = useState({
    caseId: '',
    sessionDate: '',
    courtName: '',
    circuit: '',
    decisionRequested: '',
    attendanceLawyer: 'الأستاذ عطية الهلباوي',
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: 'المساعد القضائي',
    priority: 'عاجل جداً' as OfficeTask['priority'],
  });

  useEffect(() => {
    fetchAllOfficeData();
  }, []);

  const fetchAllOfficeData = async () => {
    try {
      const [sRes, cRes, csRes, ssRes, dRes, tRes, fRes] = await Promise.all([
        fetch('/api/office/stats').then((r) => r.json()),
        fetch('/api/office/clients').then((r) => r.json()),
        fetch('/api/office/cases').then((r) => r.json()),
        fetch('/api/office/sessions').then((r) => r.json()),
        fetch('/api/office/documents').then((r) => r.json()),
        fetch('/api/office/tasks').then((r) => r.json()),
        fetch('/api/office/financials').then((r) => r.json()),
      ]);

      setStats(sRes);
      setClients(cRes);
      setCases(csRes);
      setSessions(ssRes);
      setDocuments(dRes);
      setTasks(tRes);
      setFinancials(fRes);
    } catch (e) {
      console.error('Error fetching office data', e);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.phone) return;
    try {
      const res = await fetch('/api/office/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientForm),
      });
      const newClient = await res.json();
      setClients([newClient, ...clients]);
      setShowAddClient(false);
      setClientForm({ name: '', phone: '', nationalId: '', address: '', notes: '' });
      fetchAllOfficeData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === caseForm.clientId);
    if (!caseForm.caseNumber || !client) return;

    try {
      const res = await fetch('/api/office/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...caseForm,
          clientName: client.name,
          status: 'قيد التداول',
        }),
      });
      const newCase = await res.json();
      setCases([newCase, ...cases]);
      setShowAddCase(false);
      fetchAllOfficeData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const c = cases.find((item) => item.id === sessionForm.caseId);
    if (!sessionForm.sessionDate || !c) return;

    try {
      const res = await fetch('/api/office/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sessionForm,
          caseNumber: `${c.caseNumber} لسنة ${c.year} (${c.court})`,
          status: 'قادمة',
        }),
      });
      const newSession = await res.json();
      setSessions([newSession, ...sessions]);
      setShowAddSession(false);
      fetchAllOfficeData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.dueDate) return;

    try {
      const res = await fetch('/api/office/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskForm,
          status: 'قيد التنفيذ',
        }),
      });
      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
      setShowAddTask(false);
      fetchAllOfficeData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTaskStatus = async (id: string, currentStatus: OfficeTask['status']) => {
    const nextStatus = currentStatus === 'مكتمل' ? 'قيد التنفيذ' : 'مكتمل';
    try {
      await fetch(`/api/office/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      setTasks(tasks.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#070d18] text-slate-100 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Office Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-amber-500/20">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-amber-100 font-['Cairo',sans-serif]">
            إدارة مكتب المستشار عطية الهلباوي
          </h2>
          <p className="text-xs text-amber-400/80 mt-1">
            منظومة المحاماة الذكية: إدارة القضايا، الجلسات، الموكلين، الأتعاب، وصياغة المذكرات
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-1.5 flex-wrap bg-[#0a1424] border border-amber-500/30 rounded-xl p-1 text-xs">
          <button
            onClick={() => setSubTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              subTab === 'overview' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            الملخص
          </button>
          <button
            onClick={() => setSubTab('cases')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              subTab === 'cases' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            القضايا ({cases.length})
          </button>
          <button
            onClick={() => setSubTab('sessions')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              subTab === 'sessions' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            رول الجلسات ({sessions.length})
          </button>
          <button
            onClick={() => setSubTab('clients')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              subTab === 'clients' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            الموكلون ({clients.length})
          </button>
          <button
            onClick={() => setSubTab('documents')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              subTab === 'documents' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            المذكرات والعقود ({documents.length})
          </button>
          <button
            onClick={() => setSubTab('tasks')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              subTab === 'tasks' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            المهام ({tasks.length})
          </button>
          <button
            onClick={() => setSubTab('financials')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              subTab === 'financials' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            الأتعاب والتحصيل
          </button>
        </div>
      </div>

      {/* SUB-TAB: OVERVIEW */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-[#0a1424] border border-amber-500/30 rounded-2xl p-4 text-right">
              <span className="text-[11px] text-slate-400 block mb-1">إجمالي القضايا</span>
              <span className="text-2xl font-bold text-amber-200 font-mono tabular-nums">{stats.totalCases || 0}</span>
            </div>
            <div className="bg-[#0a1424] border border-amber-500/30 rounded-2xl p-4 text-right">
              <span className="text-[11px] text-slate-400 block mb-1">قضايا متداولة</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">{stats.activeCases || 0}</span>
            </div>
            <div className="bg-[#0a1424] border border-amber-500/30 rounded-2xl p-4 text-right">
              <span className="text-[11px] text-slate-400 block mb-1">الموكلون</span>
              <span className="text-2xl font-bold text-amber-200 font-mono tabular-nums">{stats.totalClients || 0}</span>
            </div>
            <div className="bg-[#0a1424] border border-amber-500/30 rounded-2xl p-4 text-right">
              <span className="text-[11px] text-slate-400 block mb-1">الجلسات القادمة</span>
              <span className="text-2xl font-bold text-blue-400 font-mono tabular-nums">{stats.upcomingSessions || 0}</span>
            </div>
            <div className="bg-[#0a1424] border border-amber-500/30 rounded-2xl p-4 text-right">
              <span className="text-[11px] text-slate-400 block mb-1">المهام الجارية</span>
              <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums">{stats.pendingTasks || 0}</span>
            </div>
            <div className="bg-[#0a1424] border border-amber-500/30 rounded-2xl p-4 text-right">
              <span className="text-[11px] text-slate-400 block mb-1">الأتعاب المحصلة</span>
              <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
                {(stats.totalCollected || 0).toLocaleString()} ج.م
              </span>
            </div>
          </div>

          {/* Quick Actions & Recent Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Sessions preview */}
            <div className="bg-[#0a1424] border border-amber-500/20 rounded-2xl p-5 border-royal-gold">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-amber-200 flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>الجلسات القضائية القادمة</span>
                </h3>
                <button
                  onClick={() => setShowAddSession(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold cursor-pointer"
                >
                  + إضافة جلسة
                </button>
              </div>

              <div className="space-y-2.5">
                {sessions.slice(0, 4).map((s) => (
                  <div key={s.id} className="p-3 rounded-xl bg-[#070d18] border border-slate-800 text-xs text-right">
                    <div className="flex justify-between items-center text-amber-300 font-bold mb-1">
                      <span>{s.courtName}</span>
                      <span className="font-mono text-slate-400">{s.sessionDate}</span>
                    </div>
                    <div className="text-slate-300 mb-1">{s.caseNumber}</div>
                    <div className="text-[11px] text-slate-400">المطلوب: {s.decisionRequested}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Urgent Tasks */}
            <div className="bg-[#0a1424] border border-amber-500/20 rounded-2xl p-5 border-royal-gold">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-amber-200 flex items-center gap-2 text-sm">
                  <CheckSquare className="w-4 h-4 text-amber-400" />
                  <span>المهام والتكليفات القضائية</span>
                </h3>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold cursor-pointer"
                >
                  + مهمة جديدة
                </button>
              </div>

              <div className="space-y-2.5">
                {tasks.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTaskStatus(t.id, t.status)}
                    className="p-3 rounded-xl bg-[#070d18] border border-slate-800 text-xs text-right flex items-center justify-between cursor-pointer hover:border-amber-500/30"
                  >
                    <div>
                      <div className={`font-semibold ${t.status === 'مكتمل' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        المكلف: {t.assignedTo} · تاريخ الاستحقاق: {t.dueDate}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'مكتمل' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: CASES */}
      {subTab === 'cases' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-amber-200">ملفات القضايا والمنازعات</h3>
            <button
              onClick={() => setShowAddCase(true)}
              className="py-2 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:brightness-110 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              <span>قيد قضية جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.map((c) => (
              <div key={c.id} className="bg-[#0a1424] border border-amber-500/30 rounded-2xl p-5 text-right space-y-2 border-royal-double">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-base font-bold text-amber-100 block">
                      دعوى رقم {c.caseNumber} لسنة {c.year}
                    </span>
                    <span className="text-xs text-amber-400/90">{c.court} — {c.circuit}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                    {c.status}
                  </span>
                </div>

                <div className="text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <p className="mb-1"><strong className="text-amber-200">الموكل:</strong> {c.clientName}</p>
                  <p className="mb-1"><strong className="text-amber-200">الخصم:</strong> {c.opponentName}</p>
                  <p className="mb-1"><strong className="text-amber-200">الموضوع:</strong> {c.claimSubject}</p>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span>الأتعاب: {c.totalAgreedFees.toLocaleString()} ج.م (المسدد: {c.paidFees.toLocaleString()})</span>
                  {c.nextSessionDate && <span className="text-amber-300 font-bold">الجلسة القادمة: {c.nextSessionDate}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: SESSIONS */}
      {subTab === 'sessions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-amber-200">رول الجلسات والمحاكم</h3>
            <button
              onClick={() => setShowAddSession(true)}
              className="py-2 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:brightness-110 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة جلسة للرول</span>
            </button>
          </div>

          <div className="bg-[#0a1424] border border-amber-500/30 rounded-2xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#070d18] text-amber-300 border-b border-amber-500/20">
                <tr>
                  <th className="p-3.5">تاريخ الجلسة</th>
                  <th className="p-3.5">المحكمة والدائرة</th>
                  <th className="p-3.5">القضية</th>
                  <th className="p-3.5">المطلوب بالجلسة</th>
                  <th className="p-3.5">الحاضر</th>
                  <th className="p-3.5">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono text-amber-200 font-bold">{s.sessionDate}</td>
                    <td className="p-3.5">{s.courtName} ({s.circuit})</td>
                    <td className="p-3.5 text-slate-300 font-medium">{s.caseNumber}</td>
                    <td className="p-3.5 text-slate-300 max-w-xs">{s.decisionRequested}</td>
                    <td className="p-3.5 text-slate-300">{s.attendanceLawyer}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50 text-[10px]">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: CLIENTS */}
      {subTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-amber-200">سجل الموكلين</h3>
            <button
              onClick={() => setShowAddClient(true)}
              className="py-2 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:brightness-110 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موكل جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((c) => (
              <div key={c.id} className="bg-[#0a1424] border border-amber-500/20 rounded-2xl p-4 text-right border-royal-gold">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-amber-100 text-sm">{c.name}</h4>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                    {c.caseCount || 1} قضايا
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p><strong className="text-amber-200">الهاتف:</strong> {c.phone}</p>
                  {c.nationalId && <p><strong className="text-amber-200">الرقم القومي:</strong> {c.nationalId}</p>}
                  {c.address && <p><strong className="text-amber-200">العنوان:</strong> {c.address}</p>}
                  {c.notes && <p className="text-slate-400 text-[11px] mt-2 italic">{c.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: DOCUMENTS */}
      {subTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-amber-200">المذكرات القانونية والعقود المصاغة</h3>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-[#0a1424] border border-amber-500/30 rounded-2xl p-5 text-right border-royal-double space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-bold text-amber-100">{doc.title}</h4>
                    <span className="text-xs text-amber-400 font-medium">النوع: {doc.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => DocumentExporter.printDocument(doc.content, doc.title)}
                      className="px-2.5 py-1 bg-[#070d18] border border-amber-500/30 rounded-lg text-xs text-amber-300 hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة</span>
                    </button>
                    <button
                      onClick={() => DocumentExporter.exportDocx(doc.content, { title: doc.title })}
                      className="px-2.5 py-1 bg-[#070d18] border border-amber-500/30 rounded-lg text-xs text-blue-300 hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Word</span>
                    </button>
                  </div>
                </div>

                <div className="bg-[#070d18] p-4 rounded-xl text-xs text-slate-200 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-sans border border-slate-800">
                  {doc.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: TASKS */}
      {subTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-amber-200">التكليفات والمهام القضائية</h3>
            <button
              onClick={() => setShowAddTask(true)}
              className="py-2 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:brightness-110 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مهمة</span>
            </button>
          </div>

          <div className="space-y-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => handleToggleTaskStatus(t.id, t.status)}
                className="p-4 rounded-2xl bg-[#0a1424] border border-amber-500/20 text-right flex items-center justify-between cursor-pointer hover:border-amber-400/40 transition-colors"
              >
                <div>
                  <h4 className={`text-sm font-bold ${t.status === 'مكتمل' ? 'line-through text-slate-500' : 'text-amber-100'}`}>
                    {t.title}
                  </h4>
                  {t.description && <p className="text-xs text-slate-400 mt-1">{t.description}</p>}
                  <p className="text-[11px] text-amber-400/80 mt-1">
                    المسؤول: {t.assignedTo} · الموعد الأقصى: {t.dueDate}
                  </p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  t.status === 'مكتمل' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: FINANCIALS */}
      {subTab === 'financials' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-amber-200">الأتعاب، المصروفات، وحركة الخزينة</h3>
          <div className="bg-[#0a1424] border border-amber-500/30 rounded-2xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#070d18] text-amber-300 border-b border-amber-500/20">
                <tr>
                  <th className="p-3.5">البيان</th>
                  <th className="p-3.5">الموكل / القضية</th>
                  <th className="p-3.5">المبلغ</th>
                  <th className="p-3.5">التاريخ</th>
                  <th className="p-3.5">طريقة الدفع</th>
                  <th className="p-3.5">رقم الإيصال</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {financials.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-amber-100">{f.type}</td>
                    <td className="p-3.5 text-slate-300">{f.clientName || 'عام'}</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">{f.amount.toLocaleString()} ج.م</td>
                    <td className="p-3.5 font-mono text-slate-400">{f.date}</td>
                    <td className="p-3.5 text-slate-300">{f.paymentMethod}</td>
                    <td className="p-3.5 font-mono text-slate-400">{f.receiptNumber || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD CLIENT */}
      {showAddClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#0a1424] border border-amber-500/40 rounded-2xl p-6 text-right">
            <h3 className="text-lg font-bold text-amber-200 mb-4">إضافة موكل جديد</h3>
            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">اسم الموكل الكامل:</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">رقم الهاتف:</label>
                <input
                  type="text"
                  required
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">الرقم القومي / السجل التجاري:</label>
                <input
                  type="text"
                  value={clientForm.nationalId}
                  onChange={(e) => setClientForm({ ...clientForm, nationalId: e.target.value })}
                  className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">العنوان والملاحظات:</label>
                <input
                  type="text"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-slate-100"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-lg hover:brightness-110 cursor-pointer"
                >
                  حفظ الموكل
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddClient(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CASE */}
      {showAddCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg bg-[#0a1424] border border-amber-500/40 rounded-2xl p-6 text-right max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-amber-200 mb-4">قيد قضية جديدة بجدول المكتب</h3>
            <form onSubmit={handleCreateCase} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">رقم القضية:</label>
                  <input
                    type="text"
                    required
                    value={caseForm.caseNumber}
                    onChange={(e) => setCaseForm({ ...caseForm, caseNumber: e.target.value })}
                    placeholder="مثال: 1420"
                    className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">السنة القضائية:</label>
                  <input
                    type="text"
                    required
                    value={caseForm.year}
                    onChange={(e) => setCaseForm({ ...caseForm, year: e.target.value })}
                    className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">الموكل:</label>
                <select
                  required
                  value={caseForm.clientId}
                  onChange={(e) => setCaseForm({ ...caseForm, clientId: e.target.value })}
                  className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2 text-slate-100"
                >
                  <option value="">اختر الموكل...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">اسم الخصم:</label>
                <input
                  type="text"
                  required
                  value={caseForm.opponentName}
                  onChange={(e) => setCaseForm({ ...caseForm, opponentName: e.target.value })}
                  className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">المحكمة:</label>
                  <input
                    type="text"
                    required
                    value={caseForm.court}
                    onChange={(e) => setCaseForm({ ...caseForm, court: e.target.value })}
                    className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">الدائرة:</label>
                  <input
                    type="text"
                    required
                    value={caseForm.circuit}
                    onChange={(e) => setCaseForm({ ...caseForm, circuit: e.target.value })}
                    className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">موضوع الدعوى:</label>
                <textarea
                  rows={2}
                  required
                  value={caseForm.claimSubject}
                  onChange={(e) => setCaseForm({ ...caseForm, claimSubject: e.target.value })}
                  placeholder="بيان موجز لوقائع النزاع والطلبات..."
                  className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-lg hover:brightness-110 cursor-pointer"
                >
                  قيد القضية
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCase(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SESSION */}
      {showAddSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#0a1424] border border-amber-500/40 rounded-2xl p-6 text-right">
            <h3 className="text-lg font-bold text-amber-200 mb-4">إضافة جلسة للرول القضائي</h3>
            <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">القضية:</label>
                <select
                  required
                  value={sessionForm.caseId}
                  onChange={(e) => {
                    const c = cases.find((item) => item.id === e.target.value);
                    setSessionForm({
                      ...sessionForm,
                      caseId: e.target.value,
                      courtName: c?.court || '',
                      circuit: c?.circuit || '',
                    });
                  }}
                  className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-slate-100"
                >
                  <option value="">اختر القضية...</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber}/{c.year} — {c.clientName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">تاريخ الجلسة:</label>
                <input
                  type="date"
                  required
                  value={sessionForm.sessionDate}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionDate: e.target.value })}
                  className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">المطلوب بالجلسة:</label>
                <input
                  type="text"
                  required
                  value={sessionForm.decisionRequested}
                  onChange={(e) => setSessionForm({ ...sessionForm, decisionRequested: e.target.value })}
                  placeholder="تقديم مذكرات، مستندات، ورود تقرير خبير..."
                  className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-lg hover:brightness-110 cursor-pointer"
                >
                  حفظ الجلسة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSession(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TASK */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#0a1424] border border-amber-500/40 rounded-2xl p-6 text-right">
            <h3 className="text-lg font-bold text-amber-200 mb-4">تكليف بمهمة قضائية جديدة</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">عنوان المهمة:</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="سداد أمانة، استخراج شهادة، إعلان صحيفة..."
                  className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">المكلف بالمهمة:</label>
                <input
                  type="text"
                  required
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">تاريخ الاستحقاق الأقصى:</label>
                <input
                  type="date"
                  required
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full bg-[#070d18] border border-amber-500/30 rounded-lg p-2.5 text-slate-100"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-lg hover:brightness-110 cursor-pointer"
                >
                  حفظ التكليف
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
