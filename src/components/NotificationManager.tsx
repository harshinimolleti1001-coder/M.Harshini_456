import React, { useState, useEffect } from 'react';
import { StudyTask } from '../types';
import { 
  Bell, 
  BellRing, 
  BellOff, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Sparkles, 
  X, 
  Volume2, 
  VolumeX, 
  Terminal,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface ToastMessage {
  id: string;
  title: string;
  text: string;
  type: 'deadline' | 'reminder' | 'backlog' | 'info';
  timestamp: string;
}

interface NotificationManagerProps {
  tasks: StudyTask[];
  onStartPomodoro?: (task: StudyTask) => void;
  isVisible: boolean;
}

export default function NotificationManager({ tasks, isVisible }: NotificationManagerProps) {
  // Browser Notification states
  const [hasSupport, setHasSupport] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  
  // Custom reminder settings
  const [reminderTime, setReminderTime] = useState(() => {
    return localStorage.getItem('study_reminder_time') || '09:00';
  });
  const [enableDailyReminders, setEnableDailyReminders] = useState(() => {
    return localStorage.getItem('study_reminders_enabled') !== 'false';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('study_notification_sound') !== 'false';
  });

  // Local state for active in-app notifications/toasts (perfect fallback for high-fidelity interactive experience inside iframes)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  // Local history of recent notification logs
  const [logs, setLogs] = useState<ToastMessage[]>(() => {
    const saved = localStorage.getItem('study_notification_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // 1. Detect support on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasSupport(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem('study_reminder_time', reminderTime);
  }, [reminderTime]);

  useEffect(() => {
    localStorage.setItem('study_reminders_enabled', String(enableDailyReminders));
  }, [enableDailyReminders]);

  useEffect(() => {
    localStorage.setItem('study_notification_sound', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('study_notification_logs', JSON.stringify(logs));
  }, [logs]);

  // Request browser Notification permissions
  const requestBrowserPermission = async () => {
    if (!hasSupport) {
      addToast('No Support', 'This browser does not support standard web notification APIs.', 'info');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        const title = 'Permission Secured! 🎉';
        const body = 'System Notifications are now enabled for the Anti-Procrastination Expert app.';
        new Notification(title, { body, icon: '/favicon.ico' });
        addToast(title, body, 'info');
      } else {
        addToast('Permission Denied', 'Browser notifications were blocked. The app will use in-app Toast notifications instead.', 'info');
      }
    } catch (err) {
      console.warn("Iframe Context Notification error, requesting standard notification fallback:", err);
      addToast('Permissions Unavailable', 'Failed to request permissions. This is standard in sandbox iframes. We successfully activated the in-app alternative.', 'info');
    }
  };

  // Sound play helper
  const playAlertSound = (type: 'deadline' | 'reminder' | 'backlog' | 'info') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      // Determine different frequencies based on notification urgency
      if (type === 'deadline') {
        // High alert double synth
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(660, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
        
        setTimeout(() => {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(880, audioCtx.currentTime);
          gain2.gain.setValueAtTime(0.12, audioCtx.currentTime);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 0.15);
        }, 180);
      } else if (type === 'backlog') {
        // Soft urgent warning chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        // Plucky study chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      }
    } catch (e) {
      console.log('Audio Context block: ', e);
    }
  };

  // Primary function to push notifications
  const triggerNotification = (title: string, body: string, type: 'deadline' | 'reminder' | 'backlog' | 'info') => {
    // 1. Play alert sound if enabled
    playAlertSound(type);

    // 2. Trigger browser native notification if permitted
    if (hasSupport && permission === 'granted') {
      try {
        new Notification(title, {
          body,
          tag: `ap-${type}`,
          icon: '/favicon.ico',
          silent: !soundEnabled
        });
      } catch (err) {
        console.log('Iframe notification send blocked by browser policy. Using Toast fallback.');
      }
    }

    // 3. Fallback/Dual-write inside custom UI queue
    addToast(title, body, type);
  };

  // Toast Queue manager
  const addToast = (title: string, text: string, type: 'deadline' | 'reminder' | 'backlog' | 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newToast: ToastMessage = {
      id: `${Date.now()}-${Math.random()}`,
      title,
      text,
      type,
      timestamp
    };

    setToasts(prev => [...prev.slice(-4), newToast]); // cap display count so as not to overwhelm
    setLogs(prev => [newToast, ...prev.slice(0, 49)]); // save last 50 logs under local persistence
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const clearLogs = () => {
    setLogs([]);
    addToast('Logs Swiped', 'Activity logs wiped successfully.', 'info');
  };

  // 4. Test Notification simulation actions
  const triggerTestReminder = () => {
    triggerNotification(
      '⏰ Time to Revise DBMS Database Keys!',
      'Solve DBMS questions now which gives you 15 XP. Consistent streaks prevent cognitive decline!',
      'reminder'
    );
  };

  const triggerTestDeadline = () => {
    triggerNotification(
      '🔥 Critical Deadline Warning!',
      'Your Pre-GATE Mock Assessment-1 is due tomorrow! Complete mock formulas revision promptly.',
      'deadline'
    );
  };

  const triggerTestBacklog = () => {
    triggerNotification(
      '⚠️ Urgent Study Backlog Detected!',
      'You currently have uncompleted tasks left in your Revision calendar. Reschedule them painlessly.',
      'backlog'
    );
  };

  // 5. Automatic scheduling loops: Runs every 20 seconds to spot deadlines, reminders, and backlogged items
  useEffect(() => {
    const todayStr = '2026-06-16'; // simulated local date
    let lastAlertedDate = '';

    const checkScheduler = () => {
      const now = new Date();
      // Generate standard hour:minute string representation
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      // Check 1: Daily schedule study alert Match
      if (enableDailyReminders && currentTimeStr === reminderTime && lastAlertedDate !== todayStr) {
        lastAlertedDate = todayStr;
        
        // Scan for remaining daily tasks for today
        const todayTasks = tasks.filter(t => t.date === todayStr && !t.completed);
        const count = todayTasks.length;
        if (count > 0) {
          triggerNotification(
            '🌟 Dynamic Study Reminder!',
            `You have ${count} pending revisions left for today. Keep up your active streak! 📚`,
            'reminder'
          );
        } else {
          triggerNotification(
            '🌻 Daily Streak Protected!',
            `Splendid work! You have finished everything on today's calendar list so far. Ready for a new milestone?`,
            'reminder'
          );
        }
      }

      // Check 2: Upcoming deadlines checker (Tasks ending on 2026-06-16 or 2026-06-17)
      const upcomingDeadlines = tasks.filter(t => {
        if (t.completed) return false;
        // Urgent types
        return t.type === 'mock_test' || t.type === 'deadline';
      });

      // Random slow trigger to mock periodic notifications when user changes something
      if (Math.random() < 0.05 && upcomingDeadlines.length > 0) {
        const randomDeadline = upcomingDeadlines[Math.floor(Math.random() * upcomingDeadlines.length)];
        triggerNotification(
          `⏱️ Upcoming Exam Task Reminder`,
          `"${randomDeadline.title}" demands attention soon. Start dynamic study to unlock ${randomDeadline.xpReward} XP.`,
          'deadline'
        );
      }
    };

    const interval = setInterval(checkScheduler, 15000); // 15 seconds ticker
    return () => clearInterval(interval);
  }, [tasks, reminderTime, enableDailyReminders]);

  // Determine badge colors based on trigger types
  const getTypeBadgeStyles = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-300';
      case 'reminder':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-300';
      case 'backlog':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-300';
      default:
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* PERSISTENT TOAST OVERLAYS REGION */}
      <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full space-y-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className="pointer-events-auto bg-slate-950/95 border border-white/10 p-4.5 rounded-2xl shadow-2xl flex items-start gap-3.5 backdrop-blur-md animate-fade-in text-slate-100"
          >
            <div className={`p-2 rounded-xl border ${getTypeBadgeStyles(toast.type)} shrink-0`}>
              {toast.type === 'deadline' ? (
                <AlertTriangle className="w-4.5 h-4.5 text-rose-400 animate-pulse" />
              ) : toast.type === 'backlog' ? (
                <Clock className="w-4.5 h-4.5 text-purple-400" />
              ) : (
                <BellRing className="w-4.5 h-4.5 text-amber-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                <span>{toast.type.toUpperCase()} ALERT</span>
                <span className="font-mono">{toast.timestamp}</span>
              </span>
              <h4 className="text-xs font-bold text-white mt-1">{toast.title}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{toast.text}</p>
            </div>

            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {isVisible && (
        <>
          {/* CORE CONTROL MODULE PORT PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Permission status card */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-[20px] shadow-xl backdrop-blur-md space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full"></div>
          
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                Integration Port
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">Status of standard web service push protocols on your browser.</p>

            <div className="mt-4 p-3.5 rounded-xl border border-white/5 bg-slate-900/50 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Browser Support:</span>
                <span className={`font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  hasSupport ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                }`}>
                  {hasSupport ? 'Compatible' : 'Incompatible'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Push Status:</span>
                <span className={`font-mono px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  permission === 'granted' ? 'bg-emerald-500/15 text-emerald-300' : 
                  permission === 'denied' ? 'bg-rose-500/15 text-rose-300' : 'bg-slate-500/15 text-slate-300'
                }`}>
                  {permission}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={requestBrowserPermission}
            className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:brightness-115 active:scale-98 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5"
          >
            <Bell className="w-4 h-4" /> Grant Push Authorization
          </button>
        </div>

        {/* Configuration settings panel */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-[20px] shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">Reminders Tune</h3>
          </div>
          <p className="text-xs text-slate-400">Configure trigger times for daily streaks checkouts.</p>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5">
              <span className="text-slate-300">Target Reminder Clock</span>
              <input 
                type="time" 
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-indigo-300 font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2.5">
              <span className="text-slate-300">Enable Daily Prompts</span>
              <button
                onClick={() => setEnableDailyReminders(!enableDailyReminders)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                  enableDailyReminders ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                  enableDailyReminders ? 'translate-x-4.5' : 'translate-x-0'
                }`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Auditory Chime Feedback</span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-1.5 border rounded-lg transition ${
                  soundEnabled 
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                    : 'bg-white/2 border-white/5 text-slate-500'
                }`}
                title={soundEnabled ? 'Synthesizer enabled' : 'Synthesizer muted'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic testing launcher sandbox */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-[20px] shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">Test Launchers</h3>
          </div>
          <p className="text-xs text-slate-400">Instantly simulate different exam/revision triggers live.</p>

          <div className="grid grid-cols-1 gap-2 pt-1">
            <button
              onClick={triggerTestReminder}
              className="text-left w-full px-3.5 py-2.5 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-indigo-500/20 text-slate-200 text-xs rounded-xl flex items-center justify-between transition group"
            >
              <span className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-amber-400" /> Daily Reminders Chime
              </span>
              <span className="text-[10px] text-slate-500 font-mono group-hover:text-amber-300">TEST</span>
            </button>

            <button
              onClick={triggerTestDeadline}
              className="text-left w-full px-3.5 py-2.5 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-rose-500/20 text-slate-200 text-xs rounded-xl flex items-center justify-between transition group"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> Extreme Deadline Chime
              </span>
              <span className="text-[10px] text-slate-500 font-mono group-hover:text-rose-300">TEST</span>
            </button>

            <button
              onClick={triggerTestBacklog}
              className="text-left w-full px-3.5 py-2.5 bg-white/2 hover:bg-white/5 border border-white/5 hover:border-purple-500/20 text-slate-200 text-xs rounded-xl flex items-center justify-between transition group"
            >
              <span className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Backlogs Warning Alarm
              </span>
              <span className="text-[10px] text-slate-500 font-mono group-hover:text-purple-300">TEST</span>
            </button>
          </div>
        </div>

      </div>

      {/* RECENT NOTIFICATION ACTION ALERTS LOGS HISTORY CARD */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-[20px] shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5 uppercase">
              <Terminal className="w-5 h-5 text-indigo-400" /> Notifications Stream
            </h3>
            <p className="text-xs text-slate-400">Detailed historical record of all upcoming reminders, deadlines, and alerts dispatched.</p>
          </div>

          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              className="px-2.5 py-1 bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg uppercase tracking-wider transition"
            >
              Clear Logs
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin select-none">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between gap-4 text-xs hover:border-white/15 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getTypeBadgeStyles(log.type)}`}>
                  {log.type}
                </span>
                <div className="truncate">
                  <span className="font-bold text-slate-200 block truncate">{log.title}</span>
                  <span className="text-[11px] text-slate-400 block truncate mt-0.5">{log.text}</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono shrink-0 font-medium">{log.timestamp}</span>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center py-6 border border-dashed border-white/5 rounded-xl bg-slate-900/10">
              <p className="text-xs text-slate-500 italic">No logs triggered. Fire mock testers above to populate data.</p>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
