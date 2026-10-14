import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Plus, 
  RefreshCw, 
  Check, 
  ArrowRight, 
  AlertCircle,
  Brain,
  ListTodo,
  Trash2,
  Bookmark
} from 'lucide-react';
import { StudyPlan, DaySchedule, TimeBlock, Priority } from '../../types';
import { generateStudyPlan } from '../../services/api';

interface PlannerViewProps {
  plan: StudyPlan;
  onUpdatePlan: (plan: StudyPlan) => void;
  onSyncToTasks: (blocks: TimeBlock[]) => void;
}

const AVAILABLE_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Computer Science',
  'Chemistry',
  'Organic Chemistry',
  'Biology',
  'Economics',
  'History',
  'Psychology',
  'Literature',
];

export const PlannerView: React.FC<PlannerViewProps> = ({
  plan,
  onUpdatePlan,
  onSyncToTasks,
}) => {
  // Form state
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Mathematics',
    'Computer Science',
    'Physics',
  ]);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [goal, setGoal] = useState('Ace upcoming midterms with deep conceptual mastery');
  const [examDates, setExamDates] = useState('Calc III in 8 days, Algorithms in 13 days, Physics in 5 days');
  const [dailyHours, setDailyHours] = useState(4);
  const [difficulty, setDifficulty] = useState('intermediate');
  const [preferences, setPreferences] = useState('Pomodoro 50/10, active recall, problem sets in morning, flashcard review before sleep');
  const [daysCount, setDaysCount] = useState(7);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // New Block Modal State
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [newBlockSubject, setNewBlockSubject] = useState('Mathematics');
  const [newBlockTopic, setNewBlockTopic] = useState('');
  const [newBlockActivity, setNewBlockActivity] = useState('');
  const [newBlockTime, setNewBlockTime] = useState('14:00 - 15:30');
  const [newBlockDuration, setNewBlockDuration] = useState(90);
  const [newBlockPriority, setNewBlockPriority] = useState<Priority>('medium');
  const [newBlockTechnique, setNewBlockTechnique] = useState('Active Recall');
  const [newBlockCheckpoint, setNewBlockCheckpoint] = useState('');

  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSubjectInput.trim();
    if (trimmed && !selectedSubjects.includes(trimmed)) {
      setSelectedSubjects([...selectedSubjects, trimmed]);
      setCustomSubjectInput('');
    }
  };

  // Generate Plan via Gemini API
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const generated = await generateStudyPlan({
        subjects: selectedSubjects,
        goal,
        examDates,
        dailyHours,
        difficulty,
        preferences,
        daysCount,
      });

      const newPlan: StudyPlan = {
        id: `plan-${Date.now()}`,
        title: generated.title || 'AI Generated Study Sprint',
        summary: generated.summary || '',
        strategyNotes: generated.strategyNotes || [],
        schedule: generated.schedule || [],
        createdAt: new Date().toISOString(),
        active: true,
        totalDays: generated.schedule?.length || daysCount,
      };

      onUpdatePlan(newPlan);
      setActiveDayIndex(0);
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setErrorMessage(err.message || 'Failed to generate study plan. Please verify server connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle completion of a block
  const handleToggleBlock = (blockId: string) => {
    const updatedSchedule = plan.schedule.map((day, dIdx) => {
      if (dIdx !== activeDayIndex) return day;
      return {
        ...day,
        timeBlocks: day.timeBlocks.map((b) =>
          b.id === blockId ? { ...b, completed: !b.completed } : b
        ),
      };
    });

    onUpdatePlan({
      ...plan,
      schedule: updatedSchedule,
    });
  };

  // Delete a block
  const handleDeleteBlock = (blockId: string) => {
    const updatedSchedule = plan.schedule.map((day, dIdx) => {
      if (dIdx !== activeDayIndex) return day;
      return {
        ...day,
        timeBlocks: day.timeBlocks.filter((b) => b.id !== blockId),
      };
    });

    onUpdatePlan({
      ...plan,
      schedule: updatedSchedule,
    });
  };

  // Add custom block
  const handleAddCustomBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockTopic.trim()) return;

    const newBlock: TimeBlock = {
      id: `block-${Date.now()}`,
      subject: newBlockSubject,
      topic: newBlockTopic.trim(),
      activity: newBlockActivity.trim() || 'Concept review & exercises',
      time: newBlockTime.trim() || '14:00 - 15:30',
      durationMinutes: Number(newBlockDuration) || 60,
      priority: newBlockPriority,
      studyTechnique: newBlockTechnique.trim() || 'Active Recall',
      checkpointGoal: newBlockCheckpoint.trim() || 'Complete session questions',
      completed: false,
    };

    const updatedSchedule = plan.schedule.map((day, dIdx) => {
      if (dIdx !== activeDayIndex) return day;
      return {
        ...day,
        timeBlocks: [...day.timeBlocks, newBlock],
      };
    });

    onUpdatePlan({
      ...plan,
      schedule: updatedSchedule,
    });

    setShowAddBlockModal(false);
    setNewBlockTopic('');
    setNewBlockActivity('');
    setNewBlockCheckpoint('');
  };

  // Sync current day blocks to task manager
  const handleSyncCurrentDay = () => {
    const currentDay = plan.schedule[activeDayIndex];
    if (currentDay && currentDay.timeBlocks.length > 0) {
      onSyncToTasks(currentDay.timeBlocks);
      setSyncSuccessMessage(`Synced ${currentDay.timeBlocks.length} study blocks from ${currentDay.day} to your Task Manager!`);
      setTimeout(() => setSyncSuccessMessage(null), 4000);
    }
  };

  const currentDay = plan?.schedule?.[activeDayIndex] || plan?.schedule?.[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Plan Header & Configuration Drawer / Form */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-400">
              <Sparkles className="w-4 h-4" />
              <span>GEMINI 3.8 FLASH STUDY ENGINE</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {plan?.title || 'Personalized Study Plan'}
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {plan?.summary || 'Generate a cognitive-load balanced study schedule tailored to your exact subjects, exam dates, and daily availability.'}
            </p>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-lg shadow-violet-600/25 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing Optimal Schedule...' : 'Regenerate Plan with AI'}</span>
          </button>
        </div>

        {/* Plan Configuration Grid */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4">
          <span className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
            Plan Generation Parameters
          </span>

          {/* Subjects Selection */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400">Target Subjects (Select all that apply):</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SUBJECTS.map((sub) => {
                const isSelected = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubject(sub)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inputs Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Primary Goal:</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                placeholder="e.g. Master Calculus proofs and DP"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Upcoming Exam Deadlines:</label>
              <input
                type="text"
                value={examDates}
                onChange={(e) => setExamDates(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                placeholder="e.g. Calc Midterm in 8 days"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Daily Hours:</label>
                <select
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  <option value={2}>2 hours</option>
                  <option value={3}>3 hours</option>
                  <option value={4}>4 hours</option>
                  <option value={5}>5 hours</option>
                  <option value={6}>6 hours</option>
                  <option value={8}>8 hours (Intensive)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Days Duration:</label>
                <select
                  value={daysCount}
                  onChange={(e) => setDaysCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  <option value={3}>3 Days Sprint</option>
                  <option value={5}>5 Days</option>
                  <option value={7}>7 Days (Full Week)</option>
                  <option value={14}>14 Days (Exam Block)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Technique Preferences:</label>
            <input
              type="text"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
              placeholder="e.g. Feynman technique, Pomodoro 50/10, active recall, problem sets"
            />
          </div>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success notification for task sync */}
        {syncSuccessMessage && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{syncSuccessMessage}</span>
          </div>
        )}

        {/* Strategy Notes from AI */}
        {plan?.strategyNotes && plan.strategyNotes.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-violet-400 flex items-center gap-1.5">
              <Brain className="w-4 h-4" />
              <span>Cognitive Architecture & Pedagogical Strategy</span>
            </span>
            <ul className="space-y-1.5">
              {plan.strategyNotes.map((note, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-violet-400 font-bold">·</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Day Schedule Viewer & Interactive Blocks */}
      <div className="space-y-4">
        {/* Day Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            {plan?.schedule?.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDayIndex(idx)}
                className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeDayIndex === idx
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {day.day}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddBlockModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Block</span>
            </button>
            <button
              onClick={handleSyncCurrentDay}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-colors"
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Sync Day to Tasks</span>
            </button>
          </div>
        </div>

        {/* Current Day Schedule Details */}
        {currentDay ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {currentDay.day} — Focus: {currentDay.focusTheme}
                </h3>
                <p className="text-xs text-slate-400">
                  {currentDay.timeBlocks.length} planned study blocks · Total time:{' '}
                  {currentDay.timeBlocks.reduce((acc, b) => acc + b.durationMinutes, 0)} minutes
                </p>
              </div>
            </div>

            {/* Time Blocks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentDay.timeBlocks.map((block) => (
                <div
                  key={block.id}
                  className={`p-5 rounded-xl border transition-all ${
                    block.completed
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleBlock(block.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                          block.completed
                            ? 'bg-violet-600 text-white'
                            : 'border border-slate-600 hover:border-violet-400'
                        }`}
                      >
                        {block.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm text-white">
                            {block.topic}
                          </span>
                          <span className="text-xs text-slate-500">·</span>
                          <span className="text-xs font-semibold text-violet-400">
                            {block.subject}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {block.activity}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      title="Delete study block"
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono tabular-nums text-slate-200">
                        {block.time} ({block.durationMinutes}m)
                      </span>
                      <span>·</span>
                      <span className="text-slate-300 font-medium">{block.studyTechnique}</span>
                    </div>

                    <span className={`text-[11px] font-semibold capitalize px-2 py-0.5 rounded ${
                      block.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300'
                        : block.priority === 'medium'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {block.priority} priority
                    </span>
                  </div>

                  {block.checkpointGoal && (
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300">
                      <span className="text-amber-400 font-medium">Checkpoint Goal: </span>
                      {block.checkpointGoal}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
            No schedule blocks found. Click "Regenerate Plan with AI" above.
          </div>
        )}
      </div>

      {/* Modal: Add Custom Block */}
      {showAddBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Add Custom Study Block</h3>
              <button
                onClick={() => setShowAddBlockModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddCustomBlock} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Subject:</label>
                <select
                  value={newBlockSubject}
                  onChange={(e) => setNewBlockSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                >
                  {AVAILABLE_SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Topic Title:</label>
                <input
                  type="text"
                  required
                  value={newBlockTopic}
                  onChange={(e) => setNewBlockTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  placeholder="e.g. Eigenvalues & Diagonalization"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Planned Activity:</label>
                <input
                  type="text"
                  value={newBlockActivity}
                  onChange={(e) => setNewBlockActivity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  placeholder="e.g. Derive characteristic polynomial & solve 5 problems"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Time Window:</label>
                  <input
                    type="text"
                    value={newBlockTime}
                    onChange={(e) => setNewBlockTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                    placeholder="14:00 - 15:30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Duration (mins):</label>
                  <input
                    type="number"
                    value={newBlockDuration}
                    onChange={(e) => setNewBlockDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Priority:</label>
                  <select
                    value={newBlockPriority}
                    onChange={(e) => setNewBlockPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Technique:</label>
                  <input
                    type="text"
                    value={newBlockTechnique}
                    onChange={(e) => setNewBlockTechnique(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                    placeholder="e.g. Feynman Technique"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Checkpoint Goal:</label>
                <input
                  type="text"
                  value={newBlockCheckpoint}
                  onChange={(e) => setNewBlockCheckpoint(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
                  placeholder="e.g. Complete 3 matrix transformations without errors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBlockModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium"
                >
                  Save Study Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
