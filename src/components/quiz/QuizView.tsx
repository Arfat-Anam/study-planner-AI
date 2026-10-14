import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight, 
  Award, 
  BookOpen, 
  AlertCircle,
  Trophy,
  Check,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quiz, QuizQuestion } from '../../types';
import { generateQuiz } from '../../services/api';

interface QuizViewProps {
  quizzes: Quiz[];
  onSaveQuiz: (quiz: Quiz) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ quizzes, onSaveQuiz }) => {
  // Generator form
  const [topic, setTopic] = useState('Vector Calculus & Stokes Theorem');
  const [subject, setSubject] = useState('Mathematics');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizType, setQuizType] = useState<'mixed' | 'mcq' | 'true_false'>('mixed');

  // Generator UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active quiz session state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);

  // Generate quiz via Gemini API
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const data = await generateQuiz({
        topic: topic.trim(),
        subject,
        questionCount,
        difficulty,
        quizType,
      });

      const newQuiz: Quiz = {
        id: `quiz-${Date.now()}`,
        title: data.title || `${topic} Quiz`,
        subject: data.subject || subject,
        topic: data.topic || topic,
        difficulty: data.difficulty as any || difficulty,
        questions: data.questions,
        totalQuestions: data.questions.length,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      setActiveQuiz(newQuiz);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setRevealedHints({});
      setIsFinished(false);
    } catch (err: any) {
      console.error('Quiz generation error:', err);
      setErrorMessage(err.message || 'Failed to generate quiz with AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (selectedAnswers[currentQuestionIndex] !== undefined) return; // Answer already locked
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleToggleHint = (qIdx: number) => {
    setRevealedHints((prev) => ({
      ...prev,
      [qIdx]: !prev[qIdx],
    }));
  };

  const handleFinishQuiz = () => {
    if (!activeQuiz) return;

    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        score++;
      }
    });

    const completedQuiz: Quiz = {
      ...activeQuiz,
      score,
      completed: true,
      questions: activeQuiz.questions.map((q, idx) => ({
        ...q,
        userSelectedIndex: selectedAnswers[idx],
      })),
    };

    setActiveQuiz(completedQuiz);
    setIsFinished(true);
    onSaveQuiz(completedQuiz);

    // Fire celebratory confetti if high score
    if (score / completedQuiz.totalQuestions >= 0.7) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore
      }
    }
  };

  // Retake or load an existing quiz
  const handleLoadPastQuiz = (q: Quiz) => {
    setActiveQuiz(q);
    setCurrentQuestionIndex(0);
    const answers: Record<number, number> = {};
    q.questions.forEach((question, idx) => {
      if (question.userSelectedIndex !== undefined) {
        answers[idx] = question.userSelectedIndex;
      }
    });
    setSelectedAnswers(answers);
    setIsFinished(q.completed);
  };

  const currentQ: QuizQuestion | undefined = activeQuiz?.questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
  const userAnswer = selectedAnswers[currentQuestionIndex];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Quiz Generator Setup Card */}
      {!activeQuiz && (
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-400">
              <Sparkles className="w-4 h-4" />
              <span>GEMINI AI QUIZ SYNTHESIZER</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Create an Adaptive Diagnostic Quiz
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Generate custom exam-grade multiple choice and conceptual tests. Each question features real-time feedback, deep pedagogical rationale, and contextual hints.
            </p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Subject Area</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="Mathematics">Mathematics (Calculus, Linear Algebra)</option>
                  <option value="Computer Science">Computer Science & Algorithms</option>
                  <option value="Physics">Physics & Electromagnetism</option>
                  <option value="Chemistry">Chemistry & Thermodynamics</option>
                  <option value="Biology">Biology & Molecular Genetics</option>
                  <option value="Economics">Economics & Statistics</option>
                  <option value="History">History & Humanities</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Specific Topic or Chapter</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Stokes Theorem, Red-Black Trees, Faraday's Law"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="easy">Easy (Fundamentals & Terms)</option>
                  <option value="medium">Medium (Application & Problem Solving)</option>
                  <option value="hard">Hard (Advanced Proofs & Rigor)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Question Count</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  <option value={3}>3 Questions (Quick check)</option>
                  <option value={5}>5 Questions (Recommended)</option>
                  <option value={8}>8 Questions (Deep practice)</option>
                  <option value={10}>10 Questions (Full exam simulation)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Format</label>
                <select
                  value={quizType}
                  onChange={(e) => setQuizType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="mixed">Mixed (MCQ + True/False)</option>
                  <option value="mcq">Multiple Choice Only</option>
                  <option value="true_false">True / False Only</option>
                </select>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-lg shadow-violet-600/30"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating Quiz Questions...' : 'Generate Practice Quiz'}</span>
            </button>
          </form>

          {/* Past Quizzes Table */}
          {quizzes.length > 0 && (
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-white">Previous Diagnostic Tests</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quizzes.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => handleLoadPastQuiz(q)}
                    className="p-4 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="font-semibold text-sm text-white truncate block">
                        {q.title}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{q.subject}</span>
                        <span>·</span>
                        <span className="capitalize">{q.difficulty}</span>
                        <span>·</span>
                        <span className="text-emerald-400 font-medium">
                          Score: {q.score ?? 0}/{q.totalQuestions}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Active Quiz Interface */}
      {activeQuiz && (
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                {activeQuiz.subject} · {activeQuiz.difficulty} Difficulty
              </span>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                {activeQuiz.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveQuiz(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
              >
                Exit Quiz
              </button>
            </div>
          </div>

          {/* Progress Navigator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</span>
              <span>
                {Object.keys(selectedAnswers).length} / {activeQuiz.questions.length} answered
              </span>
            </div>
            <div className="grid grid-flow-col auto-cols-fr gap-1.5">
              {activeQuiz.questions.map((_, idx) => {
                const ans = selectedAnswers[idx];
                const isCurrent = idx === currentQuestionIndex;
                let bg = 'bg-slate-800';
                if (ans !== undefined) {
                  bg = ans === activeQuiz.questions[idx].correctAnswerIndex ? 'bg-emerald-500' : 'bg-rose-500';
                }
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-2 rounded-full transition-all ${bg} ${
                      isCurrent ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-slate-900' : ''
                    }`}
                    title={`Question ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Current Question Body */}
          {currentQ && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <span className="text-xs font-semibold text-slate-400">Question {currentQuestionIndex + 1}</span>
                <p className="text-base text-white font-medium leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = userAnswer === optIdx;
                  const isCorrect = currentQ.correctAnswerIndex === optIdx;

                  let optionStyle = 'bg-slate-950/50 border-slate-800 text-slate-200 hover:border-violet-500/50 hover:bg-slate-950';

                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-950/30 border-emerald-500/60 text-emerald-200';
                    } else if (isSelected) {
                      optionStyle = 'bg-rose-950/30 border-rose-500/60 text-rose-200';
                    } else {
                      optionStyle = 'bg-slate-950/20 border-slate-900 text-slate-500 opacity-50';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between gap-4 ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-slate-800/80 flex items-center justify-center text-xs text-slate-300 font-mono">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                      </div>

                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Hint Drawer */}
              {!isAnswered && (
                <div>
                  <button
                    onClick={() => handleToggleHint(currentQuestionIndex)}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{revealedHints[currentQuestionIndex] ? 'Hide Hint' : 'Need a hint?'}</span>
                  </button>
                  {revealedHints[currentQuestionIndex] && (
                    <p className="mt-2 p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 leading-relaxed">
                      💡 {currentQ.hint}
                    </p>
                  )}
                </div>
              )}

              {/* Explanation Box (Visible once answered) */}
              {isAnswered && (
                <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-800/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-violet-300">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span>Pedagogical Explanation</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="px-4 py-2 rounded-lg bg-slate-800 disabled:opacity-40 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Previous
                </button>

                {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-xs font-medium text-white transition-colors"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleFinishQuiz}
                    disabled={Object.keys(selectedAnswers).length < activeQuiz.questions.length}
                    className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-medium text-white transition-colors shadow-lg shadow-emerald-600/30"
                  >
                    Finish & View Score
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Score Summary Modal/Card */}
          {isFinished && (
            <div className="p-6 rounded-xl bg-slate-950 border border-violet-500/40 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Diagnostic Completed!</h3>
                <p className="text-2xl font-extrabold text-violet-300 tabular-nums">
                  {activeQuiz.score} / {activeQuiz.totalQuestions} ({Math.round(((activeQuiz.score || 0) / activeQuiz.totalQuestions) * 100)}%)
                </p>
                <p className="text-xs text-slate-400">
                  {activeQuiz.score === activeQuiz.totalQuestions
                    ? 'Flawless performance! You have mastered this concept.'
                    : 'Good work! Review missed questions above or generate a fresh diagnostic quiz.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setRevealedHints({});
                    setIsFinished(false);
                    setCurrentQuestionIndex(0);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Retake This Quiz
                </button>
                <button
                  onClick={() => {
                    setActiveQuiz(null);
                    setIsFinished(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-xs text-white font-medium"
                >
                  Create New Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
