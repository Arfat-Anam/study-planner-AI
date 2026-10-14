import React, { useState, useEffect } from 'react';
import { Sidebar, NavigationTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { PlannerView } from './components/planner/PlannerView';
import { TutorView } from './components/tutor/TutorView';
import { QuizView } from './components/quiz/QuizView';
import { NotesAndFlashcardsView } from './components/notes/NotesAndFlashcardsView';
import { TaskManagerView } from './components/tasks/TaskManagerView';
import { CalendarView } from './components/calendar/CalendarView';
import { FocusTimerView } from './components/timer/FocusTimerView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { storageService } from './services/storage';
import { 
  UserProfile, 
  StudyPlan, 
  Task, 
  UpcomingExam, 
  StudyNote, 
  Flashcard, 
  Quiz, 
  FocusSessionRecord,
  TimeBlock
} from './types';

export default function App() {
  // Navigation & UI state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [timerInitialSubject, setTimerInitialSubject] = useState('Mathematics');

  // Persistent Domain States
  const [user, setUser] = useState<UserProfile>(() => storageService.getUser());
  const [plan, setPlan] = useState<StudyPlan>(() => storageService.getPlan());
  const [tasks, setTasks] = useState<Task[]>(() => storageService.getTasks());
  const [exams, setExams] = useState<UpcomingExam[]>(() => storageService.getExams());
  const [notes, setNotes] = useState<StudyNote[]>(() => storageService.getNotes());
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => storageService.getFlashcards());
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => storageService.getQuizzes());
  const [sessions, setSessions] = useState<FocusSessionRecord[]>(() => storageService.getSessions());

  // Task Toggle Handler
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        // update user task count
        setUser((prev) => {
          const newCount = nextState ? prev.completedTasksCount + 1 : Math.max(0, prev.completedTasksCount - 1);
          const nextUser = { ...prev, completedTasksCount: newCount };
          storageService.saveUser(nextUser);
          return nextUser;
        });
        return { ...t, completed: nextState };
      }
      return t;
    });

    setTasks(updated);
    storageService.saveTasks(updated);
  };

  // Schedule Block Toggle Handler
  const handleToggleTimeBlock = (blockId: string) => {
    if (!plan || !plan.schedule) return;
    const updatedSchedule = plan.schedule.map((day) => ({
      ...day,
      timeBlocks: day.timeBlocks.map((b) =>
        b.id === blockId ? { ...b, completed: !b.completed } : b
      ),
    }));

    const updatedPlan: StudyPlan = {
      ...plan,
      schedule: updatedSchedule,
    };

    setPlan(updatedPlan);
    storageService.savePlan(updatedPlan);
  };

  // Update Plan Handler
  const handleUpdatePlan = (newPlan: StudyPlan) => {
    setPlan(newPlan);
    storageService.savePlan(newPlan);
  };

  // Sync Plan Blocks to Task Manager
  const handleSyncToTasks = (blocks: TimeBlock[]) => {
    const newTasks: Task[] = blocks.map((b) => ({
      id: `task-synced-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${b.topic} (${b.activity})`,
      subject: b.subject,
      priority: b.priority,
      dueDate: new Date().toISOString().split('T')[0],
      estimatedMinutes: b.durationMinutes,
      completed: false,
      description: `Technique: ${b.studyTechnique} | Goal: ${b.checkpointGoal}`,
      createdAt: new Date().toISOString(),
    }));

    const updated = [...newTasks, ...tasks];
    setTasks(updated);
    storageService.saveTasks(updated);
  };

  // Log completed session
  const handleLogCompletedSession = (
    durationMinutes: number,
    subject: string,
    mode: 'focus' | 'short_break' | 'long_break'
  ) => {
    const newRecord = storageService.logCompletedSession(durationMinutes, subject, mode);
    setSessions((prev) => [newRecord, ...prev]);
    if (mode === 'focus') {
      setUser(storageService.getUser());
    }
  };

  // Add Exam
  const handleAddExam = (newExam: UpcomingExam) => {
    const updated = [newExam, ...exams];
    setExams(updated);
    storageService.saveExams(updated);
  };

  // Update Notes
  const handleSaveNotes = (updatedNotes: StudyNote[]) => {
    setNotes(updatedNotes);
    storageService.saveNotes(updatedNotes);
  };

  // Update Flashcards
  const handleSaveFlashcards = (updatedCards: Flashcard[]) => {
    setFlashcards(updatedCards);
    storageService.saveFlashcards(updatedCards);
  };

  // Update Quizzes
  const handleSaveQuiz = (completedQuiz: Quiz) => {
    const updated = [completedQuiz, ...quizzes.filter((q) => q.id !== completedQuiz.id)];
    setQuizzes(updated);
    storageService.saveQuizzes(updated);
  };

  // Update Tasks list
  const handleUpdateTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    storageService.saveTasks(updatedTasks);
  };

  // Start Focus Sprint directly from any view
  const handleStartFocus = (subject?: string) => {
    if (subject) setTimerInitialSubject(subject);
    setCurrentTab('timer');
  };

  // Reset Demo Data
  const handleResetData = () => {
    if (window.confirm('Reset StudyPilot AI demo data to factory defaults?')) {
      storageService.resetToDefaults();
      setUser(storageService.getUser());
      setPlan(storageService.getPlan());
      setTasks(storageService.getTasks());
      setExams(storageService.getExams());
      setNotes(storageService.getNotes());
      setFlashcards(storageService.getFlashcards());
      setQuizzes(storageService.getQuizzes());
      setSessions(storageService.getSessions());
      setCurrentTab('dashboard');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        onResetData={handleResetData}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          user={user}
        />

        {/* Viewport Content Canvas */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              user={user}
              plan={plan}
              tasks={tasks}
              exams={exams}
              onToggleTask={handleToggleTask}
              onToggleTimeBlock={handleToggleTimeBlock}
              onNavigate={setCurrentTab}
              onStartFocus={handleStartFocus}
            />
          )}

          {currentTab === 'planner' && (
            <PlannerView
              plan={plan}
              onUpdatePlan={handleUpdatePlan}
              onSyncToTasks={handleSyncToTasks}
            />
          )}

          {currentTab === 'tutor' && <TutorView />}

          {currentTab === 'quizzes' && (
            <QuizView
              quizzes={quizzes}
              onSaveQuiz={handleSaveQuiz}
            />
          )}

          {currentTab === 'notes' && (
            <NotesAndFlashcardsView
              notes={notes}
              flashcards={flashcards}
              onSaveNotes={handleSaveNotes}
              onSaveFlashcards={handleSaveFlashcards}
            />
          )}

          {currentTab === 'tasks' && (
            <TaskManagerView
              tasks={tasks}
              onUpdateTasks={handleUpdateTasks}
              onToggleTask={handleToggleTask}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              plan={plan}
              tasks={tasks}
              exams={exams}
              onAddExam={handleAddExam}
            />
          )}

          {currentTab === 'timer' && (
            <FocusTimerView
              initialSubject={timerInitialSubject}
              onLogCompletedSession={handleLogCompletedSession}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              user={user}
              sessions={sessions}
              tasks={tasks}
              quizzes={quizzes}
              flashcards={flashcards}
            />
          )}
        </main>
      </div>
    </div>
  );
}
