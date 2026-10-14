export type Subject = 
  | 'Mathematics'
  | 'Physics'
  | 'Computer Science'
  | 'Biology'
  | 'Chemistry'
  | 'Organic Chemistry'
  | 'History'
  | 'Economics'
  | 'Psychology'
  | 'Literature'
  | 'General';

export type Priority = 'high' | 'medium' | 'low';

export interface UserProfile {
  name: string;
  major: string;
  avatarUrl: string;
  weeklyGoalHours: number;
  streakDays: number;
  totalStudyMinutes: number;
  completedTasksCount: number;
}

export interface TimeBlock {
  id: string;
  time: string;
  subject: string;
  topic: string;
  activity: string;
  durationMinutes: number;
  priority: Priority;
  studyTechnique: string;
  checkpointGoal: string;
  completed?: boolean;
}

export interface DaySchedule {
  day: string;
  date: string;
  focusTheme: string;
  timeBlocks: TimeBlock[];
}

export interface StudyPlan {
  id: string;
  title: string;
  summary: string;
  strategyNotes: string[];
  schedule: DaySchedule[];
  createdAt: string;
  active: boolean;
  totalDays: number;
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  priority: Priority;
  dueDate: string;
  estimatedMinutes: number;
  completed: boolean;
  description?: string;
  createdAt: string;
}

export interface UpcomingExam {
  id: string;
  title: string;
  subject: string;
  date: string;
  daysRemaining: number;
  priority: Priority;
  targetGrade: string;
  notes?: string;
}

export interface TutorMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  mode?: string;
  subject?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'true_false';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint: string;
  userSelectedIndex?: number;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  score?: number;
  totalQuestions: number;
  completed: boolean;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  category: string;
  subject: string;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: string;
  lastReviewed?: string;
  state: 'new' | 'learning' | 'review' | 'mastered';
}

export interface StudyNote {
  id: string;
  title: string;
  subject: string;
  content: string;
  summary?: string;
  keyTakeaways?: string[];
  activeRecallQuestions?: string[];
  memoryAids?: string[];
  tags: string[];
  updatedAt: string;
}

export interface FocusSessionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  subject: string;
  mode: 'focus' | 'short_break' | 'long_break';
  completedAt: string;
}
