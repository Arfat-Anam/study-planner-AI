import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckSquare,
  Calendar as CalendarIcon,
  Timer,
  BarChart3,
  RotateCcw,
  Flame,
  ChevronLeft,
  ChevronRight,
  Target,
  X,
} from 'lucide-react';
import { UserProfile } from '../../types';

export type NavigationTab = 
  | 'dashboard'
  | 'planner'
  | 'tutor'
  | 'quizzes'
  | 'notes'
  | 'tasks'
  | 'calendar'
  | 'timer'
  | 'analytics';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  user: UserProfile;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onResetData: () => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'planner', label: 'AI Study Planner', icon: CalendarCheck, badge: 'AI' },
  { id: 'tutor', label: 'AI Concept Tutor', icon: GraduationCap, badge: 'AI' },
  { id: 'quizzes', label: 'AI Quiz Generator', icon: Sparkles, badge: 'AI' },
  { id: 'notes', label: 'Notes & Flashcards', icon: BookOpen },
  { id: 'tasks', label: 'Task Manager', icon: CheckSquare },
  { id: 'calendar', label: 'Calendar View', icon: CalendarIcon },
  { id: 'timer', label: 'Focus Timer', icon: Timer },
  { id: 'analytics', label: 'Study Analytics', icon: BarChart3 },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onResetData,
}) => {
  const goalProgress = Math.min(100, Math.round(((user.totalStudyMinutes / 60) / user.weeklyGoalHours) * 100));

  const navContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800/80 text-slate-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/30 text-white font-bold tracking-tight">
            SP
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                StudyPilot <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">AI</span>
              </span>
              <span className="text-xs text-slate-400">Intelligent Learning OS</span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          aria-label="Close navigation drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-violet-600/20 text-violet-200 border border-violet-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between text-left">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Study Stats & Goal Card */}
      {!isCollapsed ? (
        <div className="p-4 mx-3 mb-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Current Streak</span>
            </span>
            <span className="font-semibold text-amber-400 tabular-nums">{user.streakDays} Days</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-violet-400" />
                <span>Weekly Target</span>
              </span>
              <span className="text-slate-300 tabular-nums font-mono text-[11px]">
                {(user.totalStudyMinutes / 60).toFixed(1)} / {user.weeklyGoalHours}h
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 flex flex-col items-center gap-2 mb-2 text-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold" title={`${user.streakDays} day streak`}>
            {user.streakDays}d
          </div>
        </div>
      )}

      {/* Footer / Reset / Collapse Controls */}
      <div className="p-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={onResetData}
          title="Reset application to initial seed data"
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {!isCollapsed && <span>Reset Demo Data</span>}
        </button>

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden flex"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 max-w-[85vw] h-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
