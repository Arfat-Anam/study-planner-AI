import { StudyPlan, Quiz, Flashcard } from '../types';

export interface GeneratePlanPayload {
  subjects: string[];
  goal: string;
  examDates: string;
  dailyHours: number;
  difficulty: string;
  preferences: string;
  daysCount: number;
}

export interface TutorPayload {
  message: string;
  subject: string;
  mode: 'step_by_step' | 'math_solver' | 'simplify' | 'concept_deep_dive';
  history?: Array<{ role: 'user' | 'model'; text: string }>;
}

export interface QuizPayload {
  topic: string;
  subject: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  quizType: 'mixed' | 'mcq' | 'true_false';
}

export interface SummarizePayload {
  content: string;
  title: string;
  subject: string;
}

export interface FlashcardsPayload {
  sourceText?: string;
  topic?: string;
  subject?: string;
  count?: number;
}

export async function generateStudyPlan(payload: GeneratePlanPayload): Promise<Omit<StudyPlan, 'id' | 'createdAt' | 'active' | 'totalDays'>> {
  const response = await fetch('/api/planner/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Failed to generate study plan' }));
    throw new Error(err.error || 'Server error occurred while generating study plan.');
  }

  return response.json();
}

export async function sendTutorMessage(payload: TutorPayload): Promise<{ text: string }> {
  const response = await fetch('/api/tutor/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Tutor service error' }));
    throw new Error(err.error || 'Failed to get explanation from AI Tutor.');
  }

  return response.json();
}

export async function generateQuiz(payload: QuizPayload): Promise<{
  title: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Array<{
    id: string;
    type: 'mcq' | 'true_false';
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    hint: string;
  }>;
}> {
  const response = await fetch('/api/quiz/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Failed to generate quiz' }));
    throw new Error(err.error || 'Server error occurred while generating quiz.');
  }

  return response.json();
}

export async function summarizeNotes(payload: SummarizePayload): Promise<{
  executiveSummary: string;
  keyTakeaways: string[];
  activeRecallQuestions: string[];
  memoryAids: string[];
}> {
  const response = await fetch('/api/notes/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Failed to summarize notes' }));
    throw new Error(err.error || 'Server error occurred while summarizing notes.');
  }

  return response.json();
}

export async function generateFlashcards(payload: FlashcardsPayload): Promise<{
  deckTitle: string;
  cards: Array<{
    id: string;
    front: string;
    back: string;
    hint: string;
    category: string;
  }>;
}> {
  const response = await fetch('/api/flashcards/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Failed to generate flashcards' }));
    throw new Error(err.error || 'Server error occurred while generating flashcards.');
  }

  return response.json();
}
