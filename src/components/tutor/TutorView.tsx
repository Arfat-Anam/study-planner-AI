import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  GraduationCap, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  BookOpen, 
  Calculator, 
  HelpCircle, 
  Layers, 
  AlertCircle 
} from 'lucide-react';
import { TutorMessage } from '../../types';
import { sendTutorMessage } from '../../services/api';

const QUICK_STARTERS = [
  {
    subject: 'Mathematics',
    mode: 'step_by_step' as const,
    label: "Explain Stokes' Theorem with a real fluid intuition",
    prompt: "Can you explain Stokes' Theorem step-by-step with an intuitive physical analogy like fluid vortexes, and show how the boundary curve relates to the surface flux?",
  },
  {
    subject: 'Computer Science',
    mode: 'concept_deep_dive' as const,
    label: 'Red-Black Tree vs AVL Tree tradeoffs',
    prompt: 'Compare Red-Black Trees and AVL trees in detail: Why does a Red-Black tree require at most 2 rotations on insert, and when should I choose one over the other in real software?',
  },
  {
    subject: 'Mathematics',
    mode: 'math_solver' as const,
    label: 'Solve Second-Order ODE: y" + 4y = 0',
    prompt: 'Solve the second-order homogeneous differential equation y" + 4y = 0 step-by-step with the characteristic equation and explain how complex roots yield sine and cosine solutions.',
  },
  {
    subject: 'Physics',
    mode: 'simplify' as const,
    label: 'Explain Lenz’s Law simply (ELI5)',
    prompt: 'Explain Lenz’s Law and electromagnetic induction like I am 12 years old without complex calculus. Why does nature resist changes in magnetic fields?',
  },
];

export const TutorView: React.FC = () => {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `Hello! I am **StudyPilot AI Master Tutor**. 

I specialize in:
- **Step-by-step concept scaffolding**
- **STEM & mathematical derivations with step explanations**
- **Simplifying intimidating subjects** (Feynman / ELI5)
- **Deep conceptual mastery & exam preparation**

Select your subject and tutoring style above, or pick one of the sample prompts below to begin!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedMode, setSelectedMode] = useState<'step_by_step' | 'math_solver' | 'simplify' | 'concept_deep_dive'>('step_by_step');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string, customMode?: any, customSub?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const modeToSend = customMode || selectedMode;
    const subToSend = customSub || selectedSubject;

    const userMsg: TutorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: modeToSend,
      subject: subToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Build conversation history format
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await sendTutorMessage({
        message: textToSend.trim(),
        subject: subToSend,
        mode: modeToSend,
        history: historyPayload,
      });

      const aiMsg: TutorMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: modeToSend,
        subject: subToSend,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Tutor error:', err);
      setErrorMessage(err.message || 'Failed to reach AI Tutor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: 'Chat cleared. What concept or problem can I help you master next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto space-y-4">
      {/* Top Controls Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          {/* Subject Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              <option value="Mathematics">Mathematics & Calculus</option>
              <option value="Computer Science">Computer Science & DSA</option>
              <option value="Physics">Physics & Mechanics</option>
              <option value="Chemistry">Chemistry & Organic Chem</option>
              <option value="Biology">Biology & Molecular Genetics</option>
              <option value="Economics">Economics & Statistics</option>
              <option value="History">History & Humanities</option>
              <option value="Literature">Literature & Philosophy</option>
            </select>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800">
            <button
              onClick={() => setSelectedMode('step_by_step')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedMode === 'step_by_step'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Step-by-Step
            </button>
            <button
              onClick={() => setSelectedMode('math_solver')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedMode === 'math_solver'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Math Solver
            </button>
            <button
              onClick={() => setSelectedMode('simplify')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedMode === 'simplify'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Simplify (ELI5)
            </button>
            <button
              onClick={() => setSelectedMode('concept_deep_dive')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedMode === 'concept_deep_dive'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Deep Dive
            </button>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="Clear conversation history"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 text-violet-400 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 space-y-2 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[11px] opacity-70 border-b border-white/10 pb-1.5 mb-1">
                  <span>{isUser ? 'You' : 'StudyPilot AI Tutor'}</span>
                  <div className="flex items-center gap-2">
                    {msg.subject && <span>{msg.subject}</span>}
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="hover:text-white transition-colors"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="prose prose-invert prose-sm max-w-none break-words whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 text-violet-400">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-slate-400 pl-1">Formulating step-by-step pedagogical explanation...</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Prompts */}
      {messages.length <= 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 shrink-0">
          {QUICK_STARTERS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedSubject(item.subject);
                setSelectedMode(item.mode);
                handleSendMessage(item.prompt, item.mode, item.subject);
              }}
              className="p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-200 block truncate">
                  {item.label}
                </span>
                <span className="text-[11px] text-slate-400 truncate block">
                  {item.subject} · {item.mode}
                </span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Bottom Chat Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="relative flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0"
      >
        <textarea
          rows={1}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={`Ask about ${selectedSubject} or paste a problem... (Press Enter to send)`}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-32"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-colors shrink-0 shadow-md shadow-violet-600/30"
          aria-label="Send message to AI Tutor"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
