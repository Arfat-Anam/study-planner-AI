import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Flame, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Play, 
  CheckSquare, 
  BookOpen, 
  AlertCircle,
  Lightbulb,
  Award,
  Target
} from 'lucide-react';
import { 
  UserProfile, 
  StudyPlan, 
  Task, 
  UpcomingExam, 
  TimeBlock 
} from '../../types';
import { NavigationTab } from '../layout/Sidebar';

interface DashboardViewProps {
  user: UserProfile;
  plan: StudyPlan;
  tasks: Task[];
  exams: UpcomingExam[];
  onToggleTask: (taskId: string) => void;
  onToggleTimeBlock: (blockId: string) => void;
  onNavigate: (tab: NavigationTab) => void;
  onStartFocus: (subject?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  plan,
  tasks,
  exams,
  onToggleTask,
  onToggleTimeBlock,
  onNavigate,
  onStartFocus,
}) => {
  // Find today's schedule
  const todaySchedule = plan?.schedule?.[0] || null;
  const todayBlocks: TimeBlock[] = todaySchedule?.timeBlocks || [];
  
  const completedTodayBlocks = todayBlocks.filter((b) => b.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  // Calculate hours studied
  const totalHours = (user.totalStudyMinutes / 60).toFixed(1);
  const progressPercent = Math.min(100, Math.round(((user.totalStudyMinutes / 60) / user.weeklyGoalHours) * 100));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner & Cognitive Tip */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-violet-950/40 border border-slate-800 p-6 md:p-8">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-400">
              <Sparkles className="w-4 h-4" />
              <span>ACTIVE COGNITIVE PROTOCOL</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Welcome back, {user.name}. You’re on a {user.streakDays}-day streak!
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your next critical milestone is the <span className="text-violet-300 font-medium">{exams[0]?.title || 'upcoming exam'}</span> in <span className="font-semibold text-white">{exams[0]?.daysRemaining || 8} days</span>. Today’s schedule prioritizes active recall and targeted problem sets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onStartFocus('Mathematics')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all shadow-lg shadow-violet-600/30"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start 25m Focus Sprint</span>
            </button>
            <button
              onClick={() => onNavigate('planner')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition-colors"
            >
              <span>View Full AI Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Study Time Logged</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tabular-nums tracking-tight">
              {totalHours}h
            </span>
            <span className="text-xs text-slate-400">/ {user.weeklyGoalHours}h goal</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Task Velocity</span>
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tabular-nums tracking-tight">
              {completedTasks.length}
            </span>
            <span className="text-xs text-slate-400">done ({pendingTasks.length} pending)</span>
          </div>
          <p className="text-xs text-emerald-400 font-medium">
            {Math.round((completedTasks.length / (tasks.length || 1)) * 100)}% completion rate
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Daily Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tabular-nums tracking-tight">
              {user.streakDays}
            </span>
            <span className="text-xs text-slate-400">consecutive days</span>
          </div>
          <p className="text-xs text-amber-400 font-medium">
            Personal best streak: 14 days
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Next Exam Horizon</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tabular-nums tracking-tight">
              {exams[0]?.daysRemaining ?? 0}
            </span>
            <span className="text-xs text-slate-400">days remaining</span>
          </div>
          <p className="text-xs text-cyan-400 font-medium truncate">
            {exams[0]?.title || 'All caught up'}
          </p>
        </div>
      </div>

      {/* Main Grid: Today's Schedule vs Upcoming Tasks & Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Today's Generated Study Blocks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                Today’s AI Study Schedule
              </h3>
              <p className="text-xs text-slate-400">
                {todaySchedule?.focusTheme || 'Focus Session & Problem Solving'} · {completedTodayBlocks}/{todayBlocks.length} completed
              </p>
            </div>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
            >
              <span>Manage Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todayBlocks.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800">
                <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-300 font-medium">No study blocks scheduled for today</p>
                <button
                  onClick={() => onNavigate('planner')}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium"
                >
                  Generate New Schedule
                </button>
              </div>
            ) : (
              todayBlocks.map((block) => (
                <div
                  key={block.id}
                  className={`p-4 rounded-xl border transition-all ${
                    block.completed
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onToggleTimeBlock(block.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                          block.completed
                            ? 'bg-violet-600 text-white'
                            : 'border border-slate-600 hover:border-violet-400'
                        }`}
                        aria-label={`Mark ${block.topic} as ${block.completed ? 'incomplete' : 'complete'}`}
                      >
                        {block.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm text-white">
                            {block.topic}
                          </span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs font-medium text-violet-300">
                            {block.subject}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {block.activity}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                          <span className="font-mono tabular-nums text-slate-300 font-medium">
                            {block.time} ({block.durationMinutes}m)
                          </span>
                          <span>·</span>
                          <span className="text-slate-400">Technique:</span>
                          <span className="text-slate-300 font-medium">{block.studyTechnique}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onStartFocus(block.subject)}
                      title="Launch Pomodoro session for this topic"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-violet-600 hover:text-white text-slate-300 transition-colors shrink-0"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {block.checkpointGoal && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
                      <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">Checkpoint: {block.checkpointGoal}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Column: Urgent Tasks & Upcoming Exams */}
        <div className="space-y-6">
          {/* Upcoming Exams Card */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Upcoming Exams</span>
              </h3>
              <button
                onClick={() => onNavigate('calendar')}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Calendar
              </button>
            </div>

            <div className="space-y-2.5">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate">
                      {exam.title}
                    </span>
                    <span className={`font-mono tabular-nums text-xs font-bold ${
                      exam.daysRemaining <= 5 ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {exam.daysRemaining}d away
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{exam.subject}</span>
                    <span className="text-slate-300">Target: {exam.targetGrade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Priority Tasks</span>
              </h3>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                View all ({pendingTasks.length})
              </button>
            </div>

            <div className="space-y-2">
              {pendingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 transition-colors"
                >
                  <button
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 w-4 h-4 rounded border border-slate-600 hover:border-emerald-400 flex items-center justify-center shrink-0"
                  >
                    {task.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 leading-tight truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                      <span>{task.subject}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">{task.estimatedMinutes}m</span>
                      <span>·</span>
                      <span className={`capitalize ${
                        task.priority === 'high' ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Learning Strategy Card */}
          <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-800/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-300">
              <Lightbulb className="w-4 h-4 text-violet-400" />
              <span>Cognitive Technique of the Day</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">Interleaved Retrieval:</strong> Instead of studying one topic for 4 hours, alternate between two related subjects (e.g. Calculus derivations and Algorithms graph problems). Switching prompts your brain to continually reload concepts from memory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
