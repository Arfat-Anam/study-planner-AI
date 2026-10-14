import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { StudyPlan, Task, UpcomingExam } from '../../types';

interface CalendarViewProps {
  plan: StudyPlan;
  tasks: Task[];
  exams: UpcomingExam[];
  onAddExam: (exam: UpcomingExam) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  plan,
  tasks,
  exams,
  onAddExam,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayDate, setSelectedDayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAddExamModal, setShowAddExamModal] = useState(false);

  // New exam form
  const [examTitle, setExamTitle] = useState('');
  const [examSubject, setExamSubject] = useState('Mathematics');
  const [examDate, setExamDate] = useState(new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0]);
  const [examTarget, setExamTarget] = useState('A');
  const [examNotes, setExamNotes] = useState('');

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    } else {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      setCurrentDate(prev);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      setCurrentDate(next);
    }
  };

  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayDate(today.toISOString().split('T')[0]);
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;

    const targetDate = new Date(examDate);
    const diffDays = Math.max(0, Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    const newExam: UpcomingExam = {
      id: `exam-${Date.now()}`,
      title: examTitle.trim(),
      subject: examSubject,
      date: examDate,
      daysRemaining: diffDays,
      priority: diffDays <= 7 ? 'high' : 'medium',
      targetGrade: examTarget,
      notes: examNotes.trim(),
    };

    onAddExam(newExam);
    setShowAddExamModal(false);
    setExamTitle('');
    setExamNotes('');
  };

  // Find events for selected day
  const selectedExams = exams.filter((e) => e.date === selectedDayDate);
  const selectedTasks = tasks.filter((t) => t.dueDate === selectedDayDate);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={handleGoToday}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              aria-label="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'day'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Day
            </button>
          </div>

          <button
            onClick={() => setShowAddExamModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-all shadow-md shadow-violet-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Exam / Milestone</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar Display vs Day Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 pb-2 border-b border-slate-800">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank offset cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[80px] p-2 rounded-xl bg-slate-950/20 border border-slate-900/40 opacity-30" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const isSelected = dateStr === selectedDayDate;

              const dayExams = exams.filter((e) => e.date === dateStr);
              const dayTasks = tasks.filter((t) => t.dueDate === dateStr);

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDayDate(dateStr)}
                  className={`min-h-[85px] p-2 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-violet-950/30 border-violet-500/80 shadow-md ring-1 ring-violet-500/50'
                      : isToday
                      ? 'bg-slate-950/90 border-violet-600/50 hover:border-violet-500'
                      : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-semibold tabular-nums w-5 h-5 rounded-full flex items-center justify-center ${
                        isToday ? 'bg-violet-600 text-white font-bold' : 'text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayExams.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" title="Exam scheduled" />
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayExams.map((e) => (
                      <div
                        key={e.id}
                        className="text-[10px] font-semibold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-1 py-0.5 rounded truncate"
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    ))}

                    {dayTasks.slice(0, 1).map((t) => (
                      <div
                        key={t.id}
                        className="text-[10px] text-slate-300 bg-slate-800/80 px-1 py-0.5 rounded truncate"
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}

                    {dayTasks.length > 1 && (
                      <span className="text-[9px] text-slate-400 block text-right">
                        +{dayTasks.length - 1} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Panel (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
              Daily Agenda
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              {new Date(selectedDayDate + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </h3>
          </div>

          {/* Exams on this day */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400">Scheduled Exams</h4>
            {selectedExams.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No exams on this date</p>
            ) : (
              selectedExams.map((ex) => (
                <div
                  key={ex.id}
                  className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/40 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-200">{ex.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      Target: {ex.targetGrade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{ex.subject}</p>
                  {ex.notes && <p className="text-[11px] text-slate-400">{ex.notes}</p>}
                </div>
              ))
            )}
          </div>

          {/* Tasks due on this day */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-semibold text-slate-400">Tasks Due</h4>
            {selectedTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tasks due on this date</p>
            ) : (
              selectedTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate">{t.title}</span>
                    <span className="text-violet-300 font-mono tabular-nums">{t.estimatedMinutes}m</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{t.subject}</span>
                    <span>·</span>
                    <span className="capitalize">{t.priority} priority</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Study Plan Block Reference for Today */}
          {selectedDayDate === new Date().toISOString().split('T')[0] && plan?.schedule?.[0] && (
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-violet-400">Today’s AI Plan Blocks</h4>
              <div className="space-y-1.5">
                {plan.schedule[0].timeBlocks.map((b) => (
                  <div key={b.id} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 text-xs space-y-0.5">
                    <div className="flex items-center justify-between font-medium text-slate-200">
                      <span className="truncate">{b.topic}</span>
                      <span className="font-mono tabular-nums text-slate-400 text-[10px]">{b.time}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">{b.subject} · {b.studyTechnique}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Exam */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Add Exam / Milestone</h3>
              <button
                onClick={() => setShowAddExamModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Exam Title:</label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. Multivariable Calculus Midterm II"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Subject:</label>
                  <select
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Target Grade:</label>
                  <input
                    type="text"
                    value={examTarget}
                    onChange={(e) => setExamTarget(e.target.value)}
                    placeholder="e.g. A (95%)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Exam Date:</label>
                <input
                  type="date"
                  required
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Topic Coverage / Notes:</label>
                <textarea
                  rows={3}
                  value={examNotes}
                  onChange={(e) => setExamNotes(e.target.value)}
                  placeholder="e.g. Covers chapters 14-16: double/triple integrals, Stokes, Gauss."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium"
                >
                  Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
