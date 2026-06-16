import React, { useState, useEffect, useRef } from 'react';
import { StudyTask } from '../types';
import { Play, Pause, RotateCcw, Flame, Sparkles, Volume2, SkipForward } from 'lucide-react';

interface PomodoroTimerProps {
  activeTask: StudyTask | null;
  onSessionComplete: (taskId: string | null, xpEarned: number) => void;
  focusTips: string[];
}

type TimerMode = 'focus' | 'short_break' | 'long_break';

export default function PomodoroTimer({ activeTask, onSessionComplete, focusTips }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [isActive, setIsActive] = useState(false);
  
  // Timer durations in seconds
  const modeDurations = {
    focus: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60
  };

  const [timeLeft, setTimeLeft] = useState(modeDurations.focus);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Focus tips carousel
  const [currentTipIdx, setCurrentTipIdx] = useState(0);

  useEffect(() => {
    if (focusTips.length > 0) {
      const interval = setInterval(() => {
        setCurrentTipIdx(prev => (prev + 1) % focusTips.length);
      }, 10000); // Swap tips every 10 seconds
      return () => clearInterval(interval);
    }
  }, [focusTips]);

  // Handle ticking
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerExpiration();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // Handle manual task swap
  useEffect(() => {
    if (activeTask) {
      setMode('focus');
      setTimeLeft(modeDurations.focus);
      setIsActive(false);
    }
  }, [activeTask]);

  // Trigger synth beep on session complete
  const triggerBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch A5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5); // half second beep
    } catch (e) {
      console.warn('Audio Context block or blocked by iframe', e);
    }
  };

  const handleTimerExpiration = () => {
    setIsActive(false);
    triggerBeep();
    
    if (mode === 'focus') {
      const rewardXp = activeTask ? activeTask.xpReward : 10;
      onSessionComplete(activeTask ? activeTask.id : null, rewardXp);
      // Auto transition to short study break
      setMode('short_break');
      setTimeLeft(modeDurations.short_break);
    } else {
      // Transition back to study sessions
      setMode('focus');
      setTimeLeft(modeDurations.focus);
    }
  };

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(modeDurations[mode]);
  };

  const handleSkip = () => {
    setIsActive(false);
    if (mode === 'focus') {
      setMode('short_break');
      setTimeLeft(modeDurations.short_break);
    } else {
      setMode('focus');
      setTimeLeft(modeDurations.focus);
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(modeDurations[newMode]);
  };

  // SVG calculations for countdown circles
  const totalSeconds = modeDurations[mode];
  const progressRatio = timeLeft / totalSeconds;
  const strokeDash = 2 * Math.PI * 90; // Circumference of radius 90 circle

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[20px] shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
      {/* Background glow glows */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/5 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full"></div>

      {/* Circle Countdown Visualizer */}
      <div className="relative flex items-center justify-center shrink-0 w-[240px] h-[240px]">
        <svg className="w-full h-full transform -rotate-90">
          {/* Outer Ring Shadow glow */}
          <circle
            cx="120"
            cy="120"
            r="90"
            className="stroke-slate-800 fill-none"
            strokeWidth="10"
          />
          {/* Animated active progress stroke */}
          <circle
            cx="120"
            cy="120"
            r="90"
            className="stroke-indigo-500 fill-none transition-all duration-300"
            strokeWidth="10"
            strokeDasharray={strokeDash}
            strokeDashoffset={strokeDash * (1 - progressRatio)}
            strokeLinecap="round"
          />
        </svg>

        {/* Floating Numbers */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-bold font-mono text-slate-100 tracking-tight">
            {displayTime}
          </span>
          <span className="text-[10px] tracking-wider uppercase font-bold text-slate-400 mt-1.5">
            {mode === 'focus' ? 'Session' : mode === 'short_break' ? 'Short Break' : 'Long Break'}
          </span>
          
          <button 
            type="button" 
            onClick={triggerBeep}
            className="p-1 text-slate-500 hover:text-indigo-400 mt-3 transition"
            title="Test Metronome Sound"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instructions & focus advice panel */}
      <div className="flex-1 space-y-5 text-center md:text-left">
        <div>
          <span className="text-xs uppercase tracking-wider text-pink-400 font-bold block mb-1">
            Focus Panel
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100">
            {mode === 'focus' 
              ? (activeTask ? `Studying: ${activeTask.title}` : 'General Pomodoro Study session')
              : 'Resting & Re-energizing...'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'focus' 
              ? (activeTask ? activeTask.description : 'Break big chapters down to ease work friction.') 
              : 'Relax your eyes. Drink water. Stretch your muscles before diving back!'}
          </p>
        </div>

        {/* Mode Toggles */}
        <div className="flex flex-wrap justify-center md:justify-start gap-1 px-1 py-1 rounded-xl bg-slate-950/40 border border-white/5 w-fit">
          <button
            onClick={() => handleModeChange('focus')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
              mode === 'focus' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => handleModeChange('short_break')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
              mode === 'short_break' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            5m Short Break
          </button>
          <button
            onClick={() => handleModeChange('long_break')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition ${
              mode === 'long_break' 
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/10' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            15m Long Break
          </button>
        </div>

        {/* Controls block */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <button
            onClick={handleToggle}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 shadow-md ${
              isActive 
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/10' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10'
            }`}
          >
            {isActive ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current" />}
            {isActive ? 'Pause' : 'Start Focus'}
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 hover:bg-white/5 dark:hover:bg-slate-800 border border-white/10 rounded-xl text-slate-300 hover:text-white transition"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleSkip}
            className="p-2.5 hover:bg-white/5 dark:hover:bg-slate-800 border border-white/10 rounded-xl text-slate-300 hover:text-white transition flex items-center gap-1"
            title="Skip current loop"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Tips Slide Widget */}
        {focusTips.length > 0 && (
          <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl flex items-start gap-2.5 max-w-sm">
            <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0 animate-pulse" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">Focus Tip Carousel</span>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed italic">
                "{focusTips[currentTipIdx]}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
