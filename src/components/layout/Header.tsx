import React from 'react';
import { Menu, Play, Sparkles, BookOpen, Flame } from 'lucide-react';
import { NavigationTab } from './Sidebar';
import { UserProfile } from '../../types';

interface HeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenMobileNav: () => void;
  user: UserProfile;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Academic Command Center', subtitle: 'Real-time overview of schedules, exam deadlines, and study momentum' },
  planner: { title: 'AI Study Planner', subtitle: 'Scientifically personalized daily & weekly study block generator' },
  tutor: { title: 'AI Concept Tutor', subtitle: 'Step-by-step reasoning, mathematical problem solving, and intuitive explanations' },
  quizzes: { title: 'AI Quiz Generator', subtitle: 'Adaptive active-recall tests with instant feedback and pedagogical explanations' },
  notes: { title: 'Notes & Spaced Flashcards', subtitle: 'Synthesized summaries, key formula extraction, and Leitner repetition' },
  tasks: { title: 'Task Manager', subtitle: 'Prioritized assignments, problem sets, and reading milestones' },
  calendar: { title: 'Study Calendar', subtitle: 'Interactive timeline of upcoming exams, target milestones, and focus blocks' },
  timer: { title: 'Focus Pomodoro', subtitle: 'Interval study sessions with synthesized ambient soundscapes' },
  analytics: { title: 'Study Analytics', subtitle: 'Subject distribution, weekly velocity, and study streak tracking' },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenMobileNav,
  user,
}) => {
  const currentInfo = TAB_TITLES[currentTab] || { title: 'StudyPilot AI', subtitle: 'Intelligent Learning OS' };

  return (
    <header className="h-16 shrink-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Zone 1: Mobile Hamburger + Breadcrumb/View Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-violet-400 uppercase tracking-wider hidden sm:inline">
              StudyPilot
            </span>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <h1 className="text-sm md:text-base font-semibold text-white tracking-tight truncate">
              {currentInfo.title}
            </h1>
          </div>
          <span className="text-[11px] text-slate-400 truncate hidden lg:block">
            {currentInfo.subtitle}
          </span>
        </div>
      </div>

      {/* Zone 2: Fast Quick Links */}
      <nav className="hidden xl:flex items-center gap-2">
        <button
          onClick={() => onSelectTab('timer')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          <Play className="w-3.5 h-3.5 text-emerald-400" />
          <span>Focus Timer</span>
        </button>
        <button
          onClick={() => onSelectTab('planner')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>New AI Plan</span>
        </button>
        <button
          onClick={() => onSelectTab('tutor')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ask Tutor</span>
        </button>
      </nav>

      {/* Zone 3: 1 Primary action or profile badge */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-full bg-slate-950/60 border border-slate-800">
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-violet-500/40"
              onError={(e) => {
                // Fallback container if image fails
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 text-[10px] font-bold text-violet-200 flex items-center justify-center -ml-7 empty:hidden">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200 leading-tight">
              {user.name}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
              {user.major}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1 pl-1 text-amber-400 text-xs font-semibold tabular-nums">
            <Flame className="w-3.5 h-3.5" />
            <span>{user.streakDays}d</span>
          </div>
        </div>
      </div>
    </header>
  );
};
