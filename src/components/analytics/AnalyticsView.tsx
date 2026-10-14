import React from 'react';
import { 
  BarChart3, 
  Flame, 
  Clock, 
  CheckSquare, 
  Award, 
  TrendingUp, 
  BookOpen, 
  Calendar,
  Layers
} from 'lucide-react';
import { UserProfile, FocusSessionRecord, Task, Quiz, Flashcard } from '../../types';

interface AnalyticsViewProps {
  user: UserProfile;
  sessions: FocusSessionRecord[];
  tasks: Task[];
  quizzes: Quiz[];
  flashcards: Flashcard[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  user,
  sessions,
  tasks,
  quizzes,
  flashcards,
}) => {
  // Compute past 7 days study hours
  const past7Days: { dateStr: string; label: string; minutes: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString(undefined, { weekday: 'short' });

    const totalDayMins = sessions
      .filter((s) => s.date === dateStr && s.mode === 'focus')
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    past7Days.push({
      dateStr,
      label,
      minutes: totalDayMins,
    });
  }

  // Max minutes for scaling bar chart (min 240 mins so scale doesn't blow up)
  const maxDayMins = Math.max(240, ...past7Days.map((d) => d.minutes));

  // Subject distribution
  const subjectTotals: Record<string, number> = {};
  sessions
    .filter((s) => s.mode === 'focus')
    .forEach((s) => {
      subjectTotals[s.subject] = (subjectTotals[s.subject] || 0) + s.durationMinutes;
    });

  const totalTrackedMins = Object.values(subjectTotals).reduce((a, b) => a + b, 0) || 1;

  // Task stats
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskCompletionRate = Math.round((completedTasks / (tasks.length || 1)) * 100);

  // Quiz stats
  const completedQuizzes = quizzes.filter((q) => q.completed);
  const avgQuizScore = completedQuizzes.length > 0
    ? Math.round(
        (completedQuizzes.reduce((acc, q) => acc + ((q.score || 0) / q.totalQuestions) * 100, 0) /
          completedQuizzes.length)
      )
    : 85;

  // Spaced repetition flashcard mastery
  const masteredCards = flashcards.filter((c) => c.state === 'mastered').length;
  const masteryRate = Math.round((masteredCards / (flashcards.length || 1)) * 100);

  // Overall Cognitive Readiness Score (composite calculation)
  const readinessScore = Math.min(
    98,
    Math.round(
      avgQuizScore * 0.4 +
        taskCompletionRate * 0.3 +
        Math.min(100, ((user.totalStudyMinutes / 60) / user.weeklyGoalHours) * 100) * 0.3
    )
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Exam Readiness Score</span>
            <Award className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tabular-nums tracking-tight">
              {readinessScore}%
            </span>
          </div>
          <p className="text-xs text-violet-300 font-medium">Composite retention metric</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Quiz Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tabular-nums tracking-tight">
              {avgQuizScore}%
            </span>
          </div>
          <p className="text-xs text-emerald-400 font-medium">Across {completedQuizzes.length} diagnostics</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Task Completion</span>
            <CheckSquare className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tabular-nums tracking-tight">
              {taskCompletionRate}%
            </span>
          </div>
          <p className="text-xs text-cyan-400 font-medium">{completedTasks} of {tasks.length} finished</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Memory Retention</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tabular-nums tracking-tight">
              {masteryRate}%
            </span>
          </div>
          <p className="text-xs text-amber-400 font-medium">{masteredCards} cards in long-term memory</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Hours Bar Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                Daily Study Hours (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-400">
                Total:{' '}
                {(past7Days.reduce((acc, d) => acc + d.minutes, 0) / 60).toFixed(1)} hours logged
              </p>
            </div>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>

          {/* SVG Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
            {past7Days.map((day) => {
              const heightPercent = Math.max(8, Math.round((day.minutes / maxDayMins) * 100));
              const hours = (day.minutes / 60).toFixed(1);
              return (
                <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] text-slate-400 font-mono tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                    {hours}h
                  </span>
                  <div className="w-full bg-slate-950/60 rounded-xl overflow-hidden flex flex-col justify-end h-44">
                    <div
                      className="w-full bg-gradient-to-t from-violet-600 to-indigo-500 rounded-xl transition-all duration-500 group-hover:from-violet-500 group-hover:to-indigo-400"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Allocation Breakdown (5 cols) */}
        <div className="lg:col-span-5 p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">
                Subject Allocation
              </h3>
              <p className="text-xs text-slate-400">
                Cognitive distribution across disciplines
              </p>
            </div>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-4">
            {Object.entries(subjectTotals).map(([sub, mins]) => {
              const pct = Math.round((mins / totalTrackedMins) * 100);
              const hrs = (mins / 60).toFixed(1);

              let barColor = 'bg-violet-500';
              if (sub.includes('Math')) barColor = 'bg-violet-500';
              else if (sub.includes('Computer')) barColor = 'bg-indigo-500';
              else if (sub.includes('Physic')) barColor = 'bg-cyan-500';
              else if (sub.includes('Chem')) barColor = 'bg-emerald-500';

              return (
                <div key={sub} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{sub}</span>
                    <span className="font-mono tabular-nums text-slate-400">
                      {hrs}h ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 28-Day Study Streak Activity Heatmap */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>28-Day Consistency Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">
              Visual log of daily focus momentum and active recall consistency
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-400 font-mono tabular-nums">
            {user.streakDays} Day Active Streak
          </span>
        </div>

        {/* Heatmap Grid (4 rows x 7 cols) */}
        <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-2 pt-2">
          {Array.from({ length: 28 }).map((_, i) => {
            const daysAgo = 27 - i;
            const d = new Date();
            d.setDate(d.getDate() - daysAgo);
            const dateStr = d.toISOString().split('T')[0];

            const dayMinutes = sessions
              .filter((s) => s.date === dateStr && s.mode === 'focus')
              .reduce((sum, s) => sum + s.durationMinutes, 0);

            let bg = 'bg-slate-950 border border-slate-800/80';
            if (dayMinutes >= 180) bg = 'bg-violet-500 border border-violet-400 shadow-sm';
            else if (dayMinutes >= 120) bg = 'bg-violet-600/80 border border-violet-500/80';
            else if (dayMinutes >= 60) bg = 'bg-violet-700/60 border border-violet-600/60';
            else if (dayMinutes > 0) bg = 'bg-violet-900/50 border border-violet-800/50';

            return (
              <div
                key={dateStr}
                className={`h-7 rounded-lg transition-transform hover:scale-110 cursor-pointer ${bg}`}
                title={`${dateStr}: ${(dayMinutes / 60).toFixed(1)}h studied`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 text-[11px] text-slate-400 pt-1">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded bg-slate-950 border border-slate-800" />
          <div className="w-2.5 h-2.5 rounded bg-violet-900/50" />
          <div className="w-2.5 h-2.5 rounded bg-violet-700/60" />
          <div className="w-2.5 h-2.5 rounded bg-violet-600" />
          <div className="w-2.5 h-2.5 rounded bg-violet-500" />
          <span>More</span>
        </div>
      </div>

      {/* Recent Focus Session Logs */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-semibold text-white">
          Logged Focus Sessions
        </h3>

        <div className="divide-y divide-slate-800/80">
          {sessions.slice(0, 8).map((session) => (
            <div
              key={session.id}
              className="py-3 flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-violet-400" />
                <span className="font-semibold text-slate-200">{session.subject}</span>
                <span className="text-slate-400">({session.mode.replace('_', ' ')})</span>
              </div>

              <div className="flex items-center gap-4 text-slate-400 font-mono tabular-nums">
                <span>{session.durationMinutes} minutes</span>
                <span>{session.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
