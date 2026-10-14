import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Wind, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Settings2,
  Bell
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface FocusTimerViewProps {
  initialSubject?: string;
  onLogCompletedSession: (durationMinutes: number, subject: string, mode: 'focus' | 'short_break' | 'long_break') => void;
}

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  initialSubject = 'Mathematics',
  onLogCompletedSession,
}) => {
  // Timer Mode: focus (25m), short_break (5m), long_break (15m)
  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');

  // Custom durations (in minutes)
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [showSettings, setShowSettings] = useState(false);

  // Active Subject
  const [activeSubject, setActiveSubject] = useState(initialSubject);

  // Time remaining in seconds
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Ambient sound selection
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'library' | 'whitenoise'>('none');
  const [ambientVolume, setAmbientVolume] = useState(0.15);
  const [isMuted, setIsMuted] = useState(false);

  // Sessions completed in this sit-down
  const [pomodorosCompleted, setPomodorosCompleted] = useState(3);
  const [sessionCompletedAlert, setSessionCompletedAlert] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Total seconds for current mode
  const currentTotalSeconds =
    mode === 'focus'
      ? focusDuration * 60
      : mode === 'short_break'
      ? shortBreakDuration * 60
      : longBreakDuration * 60;

  // Switch mode helper
  const handleSwitchMode = (newMode: 'focus' | 'short_break' | 'long_break') => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'focus') {
      setTimeLeft(focusDuration * 60);
    } else if (newMode === 'short_break') {
      setTimeLeft(shortBreakDuration * 60);
    } else {
      setTimeLeft(longBreakDuration * 60);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, focusDuration, shortBreakDuration, longBreakDuration, activeSubject]);

  // When timer completes
  const handleTimerComplete = () => {
    setIsRunning(false);
    soundManager.playCompletionChime();

    const durationMinutes =
      mode === 'focus' ? focusDuration : mode === 'short_break' ? shortBreakDuration : longBreakDuration;

    onLogCompletedSession(durationMinutes, activeSubject, mode);

    if (mode === 'focus') {
      setPomodorosCompleted((prev) => prev + 1);
      setSessionCompletedAlert(`Great focus session! ${durationMinutes} minutes logged to StudyPilot analytics.`);
      // Auto suggest short break
      handleSwitchMode('short_break');
    } else {
      setSessionCompletedAlert(`Break completed. Ready for the next deep work sprint!`);
      handleSwitchMode('focus');
    }

    setTimeout(() => {
      setSessionCompletedAlert(null);
    }, 6000);
  };

  // Toggle ambient sound
  const handleAmbientChange = (type: 'none' | 'rain' | 'library' | 'whitenoise') => {
    setAmbientSound(type);
    if (isMuted || type === 'none') {
      soundManager.stopAmbient();
    } else {
      soundManager.setAmbient(type, ambientVolume);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (ambientSound !== 'none') {
        soundManager.setAmbient(ambientSound, ambientVolume);
      }
    } else {
      setIsMuted(true);
      soundManager.stopAmbient();
    }
  };

  // Stop ambient on unmount
  useEffect(() => {
    return () => {
      soundManager.stopAmbient();
    };
  }, []);

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG Progress circle calculations
  const progressPercent = ((currentTotalSeconds - timeLeft) / currentTotalSeconds) * 100;
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Session Completed Alert Banner */}
      {sessionCompletedAlert && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/60 text-emerald-200 text-sm flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{sessionCompletedAlert}</span>
          </div>
          <button
            onClick={() => setSessionCompletedAlert(null)}
            className="text-xs text-emerald-300 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Focus Dashboard Card */}
      <div className="p-8 md:p-12 rounded-3xl bg-slate-900 border border-slate-800 space-y-8 text-center relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-violet-600/10 blur-3xl pointer-events-none rounded-full" />

        {/* Mode Selector Tabs */}
        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => handleSwitchMode('focus')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'focus'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Focus Sprint ({focusDuration}m)
          </button>
          <button
            onClick={() => handleSwitchMode('short_break')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'short_break'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Short Break ({shortBreakDuration}m)
          </button>
          <button
            onClick={() => handleSwitchMode('long_break')}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'long_break'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Long Break ({longBreakDuration}m)
          </button>
        </div>

        {/* Circular Countdown Timer */}
        <div className="relative w-72 h-72 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="144"
              cy="144"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-800"
              fill="transparent"
            />
            {/* Active Progress */}
            <circle
              cx="144"
              cy="144"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-500 ${
                mode === 'focus' ? 'text-violet-500' : 'text-emerald-500'
              }`}
              fill="transparent"
            />
          </svg>

          {/* Centered Time Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span className="text-5xl md:text-6xl font-extrabold text-white font-mono tracking-tighter tabular-nums">
              {timeFormatted}
            </span>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              {mode === 'focus' ? activeSubject : 'Recharge Break'}
            </span>
          </div>
        </div>

        {/* Timer Play / Pause / Reset Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              soundManager.playSoftClick();
              setIsRunning(!isRunning);
            }}
            className={`px-8 py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center gap-2.5 shadow-xl ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause Sprint</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Sprint</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(currentTotalSeconds);
            }}
            title="Reset Timer"
            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Customize Durations"
            className={`p-3.5 rounded-2xl border transition-colors ${
              showSettings
                ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* Pomodoros Completed Tally */}
        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-400">
          <span>Daily Focus Sprints:</span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < pomodorosCompleted ? 'bg-violet-500' : 'bg-slate-800'
                }`}
                title={`Sprint ${i + 1}`}
              />
            ))}
          </div>
          <span className="font-mono tabular-nums text-slate-300 font-semibold pl-1">
            ({pomodorosCompleted} completed)
          </span>
        </div>

        {/* Settings Box (If Toggled) */}
        {showSettings && (
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left max-w-md mx-auto space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Interval Configuration
            </h4>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Subject Tagging:</label>
              <select
                value={activeSubject}
                onChange={(e) => setActiveSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Focus (min):</label>
                <input
                  type="number"
                  value={focusDuration}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFocusDuration(val);
                    if (mode === 'focus') setTimeLeft(val * 60);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Short (min):</label>
                <input
                  type="number"
                  value={shortBreakDuration}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setShortBreakDuration(val);
                    if (mode === 'short_break') setTimeLeft(val * 60);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Long (min):</label>
                <input
                  type="number"
                  value={longBreakDuration}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLongBreakDuration(val);
                    if (mode === 'long_break') setTimeLeft(val * 60);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Synthesized Ambient Audio Soundscapes */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">
              Synthesized Focus Soundscapes (Zero-latency Web Audio)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                isMuted
                  ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => handleAmbientChange('none')}
            className={`p-3 rounded-xl border text-left transition-all ${
              ambientSound === 'none'
                ? 'bg-violet-600/20 border-violet-500/40 text-violet-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-xs font-semibold block">Silent</span>
            <span className="text-[10px] text-slate-500">Pure quiet focus</span>
          </button>

          <button
            onClick={() => handleAmbientChange('rain')}
            className={`p-3 rounded-xl border text-left transition-all ${
              ambientSound === 'rain'
                ? 'bg-violet-600/20 border-violet-500/40 text-violet-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-semibold">Gentle Rain</span>
            </div>
            <span className="text-[10px] text-slate-500">Brown noise filter</span>
          </button>

          <button
            onClick={() => handleAmbientChange('library')}
            className={`p-3 rounded-xl border text-left transition-all ${
              ambientSound === 'library'
                ? 'bg-violet-600/20 border-violet-500/40 text-violet-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold">Library Hum</span>
            </div>
            <span className="text-[10px] text-slate-500">Soft acoustic murmur</span>
          </button>

          <button
            onClick={() => handleAmbientChange('whitenoise')}
            className={`p-3 rounded-xl border text-left transition-all ${
              ambientSound === 'whitenoise'
                ? 'bg-violet-600/20 border-violet-500/40 text-violet-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-semibold">White Noise</span>
            </div>
            <span className="text-[10px] text-slate-500">Static noise cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
