import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCw, 
  CheckCircle2, 
  Lightbulb, 
  HelpCircle, 
  Clock, 
  AlertCircle,
  Tag,
  Check
} from 'lucide-react';
import { StudyNote, Flashcard } from '../../types';
import { summarizeNotes, generateFlashcards } from '../../services/api';

interface NotesAndFlashcardsViewProps {
  notes: StudyNote[];
  flashcards: Flashcard[];
  onSaveNotes: (notes: StudyNote[]) => void;
  onSaveFlashcards: (cards: Flashcard[]) => void;
}

export const NotesAndFlashcardsView: React.FC<NotesAndFlashcardsViewProps> = ({
  notes,
  flashcards,
  onSaveNotes,
  onSaveFlashcards,
}) => {
  const [activeSection, setActiveSection] = useState<'notes' | 'flashcards'>('notes');

  // Notes state
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('Mathematics');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('Calculus, Vector');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showCardHint, setShowCardHint] = useState(false);
  const [showGenCardsModal, setShowGenCardsModal] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genSubject, setGenSubject] = useState('Computer Science');
  const [genCount, setGenCount] = useState(6);
  const [isGenCardsLoading, setIsGenCardsLoading] = useState(false);
  const [flashcardError, setFlashcardError] = useState<string | null>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  // Start creating new note
  const handleStartNewNote = () => {
    setIsEditingNote(true);
    setSelectedNoteId('');
    setNoteTitle('');
    setNoteSubject('Computer Science');
    setNoteContent('');
    setNoteTags('Algorithms, Midterm');
  };

  // Start editing existing note
  const handleStartEdit = (note: StudyNote) => {
    setIsEditingNote(true);
    setSelectedNoteId(note.id);
    setNoteTitle(note.title);
    setNoteSubject(note.subject);
    setNoteContent(note.content);
    setNoteTags(note.tags.join(', '));
  };

  // Save note
  const handleSaveNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const tagsArray = noteTags.split(',').map((t) => t.trim()).filter(Boolean);

    if (selectedNoteId) {
      // Update existing
      const updated = notes.map((n) =>
        n.id === selectedNoteId
          ? {
              ...n,
              title: noteTitle.trim(),
              subject: noteSubject,
              content: noteContent.trim(),
              tags: tagsArray,
              updatedAt: new Date().toISOString(),
            }
          : n
      );
      onSaveNotes(updated);
    } else {
      // Create new
      const newNote: StudyNote = {
        id: `note-${Date.now()}`,
        title: noteTitle.trim(),
        subject: noteSubject,
        content: noteContent.trim(),
        tags: tagsArray,
        updatedAt: new Date().toISOString(),
      };
      onSaveNotes([newNote, ...notes]);
      setSelectedNoteId(newNote.id);
    }

    setIsEditingNote(false);
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    onSaveNotes(updated);
    if (selectedNoteId === id) {
      setSelectedNoteId(updated[0]?.id || '');
    }
  };

  // AI Summarize selected note
  const handleSummarizeCurrentNote = async () => {
    if (!selectedNote) return;
    setIsSummarizing(true);
    setNoteError(null);

    try {
      const summaryResult = await summarizeNotes({
        content: selectedNote.content,
        title: selectedNote.title,
        subject: selectedNote.subject,
      });

      const updated = notes.map((n) =>
        n.id === selectedNote.id
          ? {
              ...n,
              summary: summaryResult.executiveSummary,
              keyTakeaways: summaryResult.keyTakeaways,
              activeRecallQuestions: summaryResult.activeRecallQuestions,
              memoryAids: summaryResult.memoryAids,
            }
          : n
      );

      onSaveNotes(updated);
    } catch (err: any) {
      console.error('Summarize error:', err);
      setNoteError(err.message || 'Failed to summarize notes.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Generate flashcards from current note
  const handleGenerateCardsFromNote = async () => {
    if (!selectedNote) return;
    setIsSummarizing(true);
    setNoteError(null);

    try {
      const res = await generateFlashcards({
        sourceText: selectedNote.content,
        topic: selectedNote.title,
        subject: selectedNote.subject,
        count: 5,
      });

      const newCards: Flashcard[] = res.cards.map((c) => ({
        id: `fc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        front: c.front,
        back: c.back,
        hint: c.hint,
        category: c.category || selectedNote.subject,
        subject: selectedNote.subject,
        intervalDays: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date().toISOString(),
        state: 'new',
      }));

      onSaveFlashcards([...newCards, ...flashcards]);
      setActiveSection('flashcards');
      setCardIndex(0);
    } catch (err: any) {
      console.error('Cards from note error:', err);
      setNoteError(err.message || 'Failed to generate flashcards from note.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Generate flashcards from topic modal
  const handleGenerateCardsFromTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTopic.trim()) return;
    setIsGenCardsLoading(true);
    setFlashcardError(null);

    try {
      const res = await generateFlashcards({
        topic: genTopic.trim(),
        subject: genSubject,
        count: genCount,
      });

      const newCards: Flashcard[] = res.cards.map((c) => ({
        id: `fc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        front: c.front,
        back: c.back,
        hint: c.hint,
        category: c.category || genTopic,
        subject: genSubject,
        intervalDays: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date().toISOString(),
        state: 'new',
      }));

      onSaveFlashcards([...newCards, ...flashcards]);
      setShowGenCardsModal(false);
      setGenTopic('');
      setCardIndex(0);
    } catch (err: any) {
      console.error('Gen cards error:', err);
      setFlashcardError(err.message || 'Failed to generate flashcards.');
    } finally {
      setIsGenCardsLoading(false);
    }
  };

  // Spaced repetition review rating
  const handleGradeCard = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (flashcards.length === 0) return;
    const currentCard = flashcards[cardIndex];
    if (!currentCard) return;

    let nextInterval = 1;
    let nextState: Flashcard['state'] = currentCard.state;

    if (rating === 'again') {
      nextInterval = 1;
      nextState = 'learning';
    } else if (rating === 'hard') {
      nextInterval = Math.max(1, Math.round(currentCard.intervalDays * 1.2));
      nextState = 'learning';
    } else if (rating === 'good') {
      nextInterval = Math.max(2, Math.round(currentCard.intervalDays * 2));
      nextState = 'review';
    } else if (rating === 'easy') {
      nextInterval = Math.max(4, Math.round(currentCard.intervalDays * 2.5));
      nextState = 'mastered';
    }

    const updatedCard: Flashcard = {
      ...currentCard,
      intervalDays: nextInterval,
      repetitions: currentCard.repetitions + 1,
      state: nextState,
      lastReviewed: new Date().toISOString(),
      nextReviewDate: new Date(Date.now() + nextInterval * 86400000).toISOString(),
    };

    const updatedCards = flashcards.map((c, i) => (i === cardIndex ? updatedCard : c));
    onSaveFlashcards(updatedCards);

    // Advance to next card
    setIsCardFlipped(false);
    setShowCardHint(false);
    if (cardIndex < flashcards.length - 1) {
      setCardIndex((prev) => prev + 1);
    } else {
      setCardIndex(0);
    }
  };

  const currentFlashcard = flashcards[cardIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Switcher (Notes vs Flashcards) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveSection('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeSection === 'notes'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Study Notes & AI Synthesis ({notes.length})</span>
          </button>
          <button
            onClick={() => setActiveSection('flashcards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeSection === 'flashcards'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Spaced Repetition Cards ({flashcards.length})</span>
          </button>
        </div>

        {activeSection === 'notes' ? (
          <button
            onClick={handleStartNewNote}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-all shadow-md shadow-violet-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        ) : (
          <button
            onClick={() => setShowGenCardsModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-all shadow-md shadow-violet-600/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Generate Deck</span>
          </button>
        )}
      </div>

      {/* SECTION 1: STUDY NOTES */}
      {activeSection === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Notes Sidebar List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Note Library
            </h3>
            <div className="space-y-2">
              {notes.map((note) => {
                const isSelected = selectedNote?.id === note.id && !isEditingNote;
                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      setSelectedNoteId(note.id);
                      setIsEditingNote(false);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-violet-600/15 border-violet-500/40 text-white'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-medium text-violet-400 mb-1">
                      <span>{note.subject}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100 line-clamp-1">
                      {note.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note Editor or View (8 cols) */}
          <div className="lg:col-span-8">
            {isEditingNote ? (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">
                    {selectedNoteId ? 'Edit Study Note' : 'Create New Study Note'}
                  </h3>
                  <button
                    onClick={() => setIsEditingNote(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Subject:</label>
                    <input
                      type="text"
                      value={noteSubject}
                      onChange={(e) => setNoteSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      placeholder="e.g. Mathematics"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Tags (comma-separated):</label>
                    <input
                      type="text"
                      value={noteTags}
                      onChange={(e) => setNoteTags(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                      placeholder="e.g. Calculus, Theorems, Exam"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Note Title:</label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-medium"
                    placeholder="e.g. Stokes Theorem & Surface Integrals Master Guide"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Content / Lecture Notes (Markdown supported):</label>
                  <textarea
                    rows={12}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 font-mono leading-relaxed"
                    placeholder="Write detailed formulas, derivations, or summaries here..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={handleSaveNote}
                    className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            ) : selectedNote ? (
              <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                {/* Note Header & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-violet-400">
                      <span>{selectedNote.subject}</span>
                      <span>·</span>
                      <span className="text-slate-400">
                        Updated {new Date(selectedNote.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {selectedNote.title}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleSummarizeCurrentNote}
                      disabled={isSummarizing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-medium transition-colors"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isSummarizing ? 'animate-spin' : ''}`} />
                      <span>{isSummarizing ? 'Analyzing...' : 'Summarize with AI'}</span>
                    </button>

                    <button
                      onClick={handleGenerateCardsFromNote}
                      disabled={isSummarizing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Extract Flashcards</span>
                    </button>

                    <button
                      onClick={() => handleStartEdit(selectedNote)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                      title="Edit note"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteNote(selectedNote.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {noteError && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{noteError}</span>
                  </div>
                )}

                {/* AI Summary Breakdown Section */}
                {selectedNote.summary && (
                  <div className="p-5 rounded-xl bg-violet-950/20 border border-violet-800/40 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-violet-300">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      <span>AI EXECUTIVE SYNTHESIS</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {selectedNote.summary}
                    </p>

                    {selectedNote.keyTakeaways && selectedNote.keyTakeaways.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                          Key Exam Takeaways:
                        </span>
                        <ul className="space-y-1">
                          {selectedNote.keyTakeaways.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-violet-400 font-bold">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedNote.activeRecallQuestions && selectedNote.activeRecallQuestions.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                          Active Recall Self-Test Questions:
                        </span>
                        <ul className="space-y-1">
                          {selectedNote.activeRecallQuestions.map((q, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-amber-400 font-bold">?</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Content Body */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Full Notes & Derivations
                  </h4>
                  <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                    {selectedNote.content}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                No notes found. Click "New Note" to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: SPACED REPETITION FLASHCARDS */}
      {activeSection === 'flashcards' && (
        <div className="space-y-6">
          {/* Deck Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-xs text-slate-400">Total Cards</span>
              <p className="text-xl font-bold text-white tabular-nums">{flashcards.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-xs text-slate-400">Due Today</span>
              <p className="text-xl font-bold text-amber-400 tabular-nums">
                {flashcards.filter((c) => new Date(c.nextReviewDate) <= new Date()).length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-xs text-slate-400">Learning Queue</span>
              <p className="text-xl font-bold text-violet-400 tabular-nums">
                {flashcards.filter((c) => c.state === 'learning' || c.state === 'new').length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-xs text-slate-400">Mastered</span>
              <p className="text-xl font-bold text-emerald-400 tabular-nums">
                {flashcards.filter((c) => c.state === 'mastered').length}
              </p>
            </div>
          </div>

          {/* Interactive Flip Card Arena */}
          {flashcards.length > 0 && currentFlashcard ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Card Container */}
              <div
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className={`relative min-h-[280px] p-8 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between select-none shadow-xl border ${
                  isCardFlipped
                    ? 'bg-violet-950/30 border-violet-500/50 text-violet-100'
                    : 'bg-slate-900 border-slate-800 text-slate-100 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-violet-400">
                    {currentFlashcard.subject} · {currentFlashcard.category}
                  </span>
                  <span className="font-mono tabular-nums">
                    Card {cardIndex + 1} of {flashcards.length}
                  </span>
                </div>

                <div className="py-6 text-center">
                  {!isCardFlipped ? (
                    <div className="space-y-3">
                      <p className="text-lg md:text-xl font-semibold leading-relaxed">
                        {currentFlashcard.front}
                      </p>
                      <span className="text-xs text-slate-500 block">
                        (Click card to reveal answer)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-base md:text-lg text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                        {currentFlashcard.back}
                      </p>
                      <span className="text-xs text-violet-400 block">
                        (Click card to view prompt)
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                  <span className="capitalize">
                    Status: <strong className="text-white">{currentFlashcard.state}</strong> (Rep #{currentFlashcard.repetitions})
                  </span>
                  {currentFlashcard.hint && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCardHint(!showCardHint);
                      }}
                      className="text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{showCardHint ? 'Hide Hint' : 'Hint'}</span>
                    </button>
                  )}
                </div>

                {showCardHint && currentFlashcard.hint && (
                  <p className="mt-3 p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200">
                    💡 {currentFlashcard.hint}
                  </p>
                )}
              </div>

              {/* Spaced Repetition Grading Controls */}
              {isCardFlipped ? (
                <div className="space-y-2 text-center">
                  <span className="text-xs text-slate-400">Rate your recall ease (SM-2 Algorithm):</span>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleGradeCard('again')}
                      className="py-2.5 px-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-semibold transition-colors"
                    >
                      Again (1d)
                    </button>
                    <button
                      onClick={() => handleGradeCard('hard')}
                      className="py-2.5 px-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800 text-amber-300 text-xs font-semibold transition-colors"
                    >
                      Hard ({Math.max(1, Math.round(currentFlashcard.intervalDays * 1.2))}d)
                    </button>
                    <button
                      onClick={() => handleGradeCard('good')}
                      className="py-2.5 px-2 rounded-xl bg-violet-950/40 hover:bg-violet-900/60 border border-violet-800 text-violet-300 text-xs font-semibold transition-colors"
                    >
                      Good ({Math.max(2, Math.round(currentFlashcard.intervalDays * 2))}d)
                    </button>
                    <button
                      onClick={() => handleGradeCard('easy')}
                      className="py-2.5 px-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-300 text-xs font-semibold transition-colors"
                    >
                      Easy ({Math.max(4, Math.round(currentFlashcard.intervalDays * 2.5))}d)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <button
                    disabled={cardIndex === 0}
                    onClick={() => {
                      setCardIndex((prev) => prev - 1);
                      setIsCardFlipped(false);
                      setShowCardHint(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-900 disabled:opacity-40 text-slate-300 hover:text-white"
                  >
                    Previous Card
                  </button>
                  <button
                    onClick={() => {
                      setCardIndex((prev) => (prev + 1) % flashcards.length);
                      setIsCardFlipped(false);
                      setShowCardHint(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
                  >
                    Next Card
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              No flashcards in deck. Click "AI Generate Deck" to create your first flashcard deck!
            </div>
          )}
        </div>
      )}

      {/* Modal: AI Generate Flashcards from Topic */}
      {showGenCardsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">AI Flashcard Generator</h3>
              <button
                onClick={() => setShowGenCardsModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleGenerateCardsFromTopic} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Subject:</label>
                <select
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="Computer Science">Computer Science & Algorithms</option>
                  <option value="Mathematics">Mathematics & Calculus</option>
                  <option value="Physics">Physics & Electromagnetism</option>
                  <option value="Chemistry">Chemistry & Thermodynamics</option>
                  <option value="Biology">Biology & Molecular Genetics</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Topic or Concept:</label>
                <input
                  type="text"
                  required
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="e.g. Dynamic Programming & Memoization"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Number of Flashcards:</label>
                <select
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value={4}>4 Cards</option>
                  <option value={6}>6 Cards (Recommended)</option>
                  <option value={8}>8 Cards</option>
                  <option value={10}>10 Cards</option>
                </select>
              </div>

              {flashcardError && (
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                  {flashcardError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGenCardsModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenCardsLoading || !genTopic.trim()}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-medium"
                >
                  {isGenCardsLoading ? 'Synthesizing...' : 'Generate Deck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
