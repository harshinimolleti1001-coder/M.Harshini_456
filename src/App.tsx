import React, { useState, useEffect } from 'react';
import { StudentProfile, StudyTask, GamificationState, NotesItem } from './types';
import Onboarding from './components/Onboarding';
import DashboardOverview from './components/DashboardOverview';
import CalendarView from './components/CalendarView';
import NotesSection from './components/NotesSection';
import AnalyticsPanel from './components/AnalyticsPanel';
import RecoveryPlanner from './components/RecoveryPlanner';
import CountdownsWidget from './components/CountdownsWidget';
import PomodoroTimer from './components/PomodoroTimer';
import NotificationManager from './components/NotificationManager';
import ExportDossier from './components/ExportDossier';
import StudyCopilotChat from './components/StudyCopilotChat';
import BadgesGalleryModal from './components/BadgesGalleryModal';
import { 
  Sparkles, 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  FileText, 
  TrendingUp, 
  HeartHandshake, 
  Moon, 
  Sun, 
  LogOut, 
  Clock, 
  AlertCircle,
  Award,
  Bell,
  MessageSquare,
  Bot
} from 'lucide-react';

export default function App() {
  // --- Persistent States ---
  const [profile, setProfile] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem('study_companion_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    const saved = localStorage.getItem('study_companion_tasks');
    if (saved) return JSON.parse(saved);

    // Beautiful mock tasks on initial load to make the app gorgeous immediately
    const todayStr = new Date('2026-06-16').toISOString().split('T')[0];
    const yesterdayStr = (() => {
      const d = new Date('2026-06-16');
      d.setDate(d.getDate() - 1);
      return d.toISOString().split('T')[0];
    })();
    const tomorrowStr = (() => {
      const d = new Date('2026-06-16');
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    })();

    return [
      {
        id: 'mock-1',
        title: 'Review ACID Transaction Properties',
        description: 'Understand isolation levels and serializability concepts.',
        subject: 'DBMS',
        duration: 25,
        date: todayStr,
        completed: false,
        type: 'session',
        xpReward: 10
      },
      {
        id: 'mock-2',
        title: 'Heapsort & Priority Queues Analysis',
        description: 'Study building Heaps and extraction processes with complexity analysis.',
        subject: 'Algorithms',
        duration: 25,
        date: todayStr,
        completed: true,
        completedAt: new Date().toISOString(),
        type: 'session',
        xpReward: 10
      },
      {
        id: 'mock-3',
        title: 'Solve Process Scheduling Past Exams',
        description: 'Practice Shortest Job First and Round Robin Gantt charts.',
        subject: 'Operating Systems',
        duration: 25,
        date: yesterdayStr,
        completed: false,
        missed: true, // past due unfinished task
        type: 'session', 
        xpReward: 12
      },
      {
        id: 'mock-4',
        title: 'Pre-GATE Mock Assessment-1',
        description: 'Complete formal 30-question CS assessment on full syllabus.',
        subject: 'Placement',
        duration: 25,
        date: tomorrowStr,
        completed: false,
        type: 'mock_test',
        xpReward: 30
      }
    ];
  });

  const [gamification, setGamification] = useState<GamificationState>(() => {
    const saved = localStorage.getItem('study_companion_gamification');
    return saved ? JSON.parse(saved) : {
      xp: 120, // Pre-load some XP to make the Level up meter clear
      level: 1,
      streak: 2,
      badges: ['Beginner']
    };
  });

  const [notes, setNotes] = useState<NotesItem[]>(() => {
    const saved = localStorage.getItem('study_companion_notes');
    if (saved) return JSON.parse(saved);

    return [
      {
        id: 'note-1',
        title: 'DBMS Transaction Isolation Cheat Sheet',
        content: `DBMS TRANSACTION CONCURRENCY CODES:
- Dirty Read: Read uncommitted modification. Prevented by Read Committed.
- Non-repeatable Read: Read different values for same query. Prevented by Repeatable Read.
- Phantom Read: Read newly added rows matching conditions. Prevented by Serializable.

2PL (Two Phase Locking):
- Growing Phase: Locks acquired, none released.
- Shrinking Phase: Locks released, none acquired.
- Strict 2PL: Releases choice exclusive locks only at transaction commit/abort.`,
        subject: 'DBMS',
        pinned: true,
        updatedAt: 'Jun 15, 2026, 11:20 AM'
      },
      {
        id: 'note-2',
        title: 'GATE 2027 Key Formula Sheet',
        content: `ALGORITHMS complexity rules:
Master Theorem: T(n) = a*T(n/b) + F(n)
If F(n) = O(n^d), then:
- a < b^d: T(n) = O(n^d)
- a = b^d: T(n) = O(n^d * log n)
- a > b^d: T(n) = O(n ^ log_b(a))

OPERATING SYSTEMS scheduling metric:
Wait Time = Turnaround Time - Burst Time`,
        subject: 'General',
        pinned: false,
        updatedAt: 'Jun 16, 2026, 09:12 AM'
      }
    ];
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'notes' | 'analytics' | 'recovery' | 'notifications'>('dashboard');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('study_companion_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  // Pomodoro-specific overlay timer
  const [currentPomodoroTask, setCurrentPomodoroTask] = useState<StudyTask | null>(null);
  const [showPomodoroPanel, setShowPomodoroPanel] = useState(false);
  const [showStudyChat, setShowStudyChat] = useState(false);
  const [showBadgesGallery, setShowBadgesGallery] = useState(false);

  // --- Synchronization & Side-effects ---
  useEffect(() => {
    localStorage.setItem('study_companion_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('study_companion_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('study_companion_gamification', JSON.stringify(gamification));
  }, [gamification]);

  useEffect(() => {
    localStorage.setItem('study_companion_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('study_companion_theme', themeMode);
    const bodyClass = document.body.classList;
    if (themeMode === 'light') {
      bodyClass.add('light-theme');
      bodyClass.remove('dark-theme');
    } else {
      bodyClass.remove('light-theme');
      bodyClass.add('dark-theme');
    }
  }, [themeMode]);

  // Streak loss penalty check on load
  useEffect(() => {
    if (!profile) return;
    const todayStr = '2026-06-16';
    
    // Check if the student study session tracker was idle yesterday (if they haven't completed any task yesterday, and streak wasn't updated)
    // To represent rewards/penalties naturally: if today is past midnight and no tasks were completed, we gently check
    // We only execute this once per calendar day simulation.
    if (gamification.streak > 0 && gamification.lastActiveDate) {
      const today = new Date(todayStr);
      const lastActive = new Date(gamification.lastActiveDate);
      const diffTime = Math.abs(today.getTime() - lastActive.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 
      if (diffDays > 1.5) {
        const freezes = gamification.streakFreezes || 0;
        if (freezes > 0) {
          // Consume streak freeze to protect streak
          setGamification(prev => ({
            ...prev,
            streakFreezes: Math.max(0, (prev.streakFreezes || 1) - 1),
            lastActiveDate: todayStr // advance lastActiveDate so it doesn't trigger again for the same missed span
          }));
          
          alert(`❄️ Streak Protected! You missed a study day, but 1 Streak Freeze was consumed to protect your active ${gamification.streak}-day streak! No XP penalty was deducted.`);
        } else {
          // Penalty: Streak is lost (reset back to 0) as requested by user ("rewards and penalties for the loss of streaks")
          setGamification(prev => ({
            ...prev,
            streak: 0,
            xp: Math.max(0, prev.xp - 15) // small penalty
          }));
          
          alert("⚠️ Consistency Warning: Streak was broken since you were offline yesterday! 15 XP deducted as failure penalty. Adjust your schedule with the AI Recovery planner to start another streak, and remember to buy a Streak Freeze (50 XP) to safeguard it next time!");
        }
      }
    }
  }, [profile]);

  // --- Event Handlers & Mutations ---
  const handleOnboardingComplete = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    // Grant onboarding bonus XP
    setGamification(prev => ({
      ...prev,
      xp: prev.xp + 50,
      badges: prev.badges.includes('Beginner') ? prev.badges : [...prev.badges, 'Beginner']
    }));
  };

  const handleStartPomodoro = (task: StudyTask) => {
    setCurrentPomodoroTask(task);
    setShowPomodoroPanel(true);
  };

  const handleSessionComplete = (taskId: string | null, xpEarned: number) => {
    const todayStr = '2026-06-16';

    // 1. Mark task completed
    if (taskId) {
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, completed: true, completedAt: new Date().toISOString(), missed: false };
        }
        return t;
      }));
    }

    // 2. Increment XP & Leveling logic
    setGamification(prev => {
      let newXp = prev.xp + xpEarned;
      // Increment streak if didn't study today already
      const studiedToday = prev.lastActiveDate === todayStr;
      const newStreak = studiedToday ? prev.streak : prev.streak + 1;
      const newLevel = Math.floor(newXp / 100) + 1;

      // Badges evaluation
      const updatedBadges = [...prev.badges];
      if (newStreak >= 3 && !updatedBadges.includes('Consistent learner')) {
        updatedBadges.push('Consistent learner');
      }
      if (newXp >= 400 && !updatedBadges.includes('Top learner')) {
        updatedBadges.push('Top learner');
      }

      return {
        ...prev,
        xp: newXp,
        streak: newStreak,
        level: newLevel,
        badges: updatedBadges,
        lastActiveDate: todayStr
      };
    });

    // Close timer overlay
    setShowPomodoroPanel(false);
    setCurrentPomodoroTask(null);
  };

  const handleAddTask = (newTaskData: Omit<StudyTask, 'id'>) => {
    const freshTask: StudyTask = {
      ...newTaskData,
      id: `task-${Date.now()}`
    };
    setTasks(prev => [...prev, freshTask]);
  };

  const handleMoveTask = (taskId: string, targetDate: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          date: targetDate,
          // If we move a missed task to a future date, clear its "missed" warning!
          missed: new Date(targetDate) < new Date('2026-06-16')
        };
      }
      return t;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleUpdateTaskPriority = (taskId: string, updates: { urgent?: boolean; important?: boolean }) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          ...updates
        };
      }
      return t;
    }));
  };

  const handleAddNote = (newNoteData: Omit<NotesItem, 'id' | 'updatedAt'>) => {
    const freshNote: NotesItem = {
      ...newNoteData,
      id: `note-${Date.now()}`,
      updatedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    setNotes(prev => [freshNote, ...prev]);
  };

  const handleUpdateNote = (updatedNote: NotesItem) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const handleQuickToggleComplete = (taskId: string) => {
    const taskObj = tasks.find(t => t.id === taskId);
    if (!taskObj) return;

    if (!taskObj.completed) {
      handleSessionComplete(taskId, taskObj.xpReward);
    } else {
      // Un-complete (Deduct XP)
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, completed: false, completedAt: undefined };
        }
        return t;
      }));
      setGamification(prev => ({
        ...prev,
        xp: Math.max(0, prev.xp - taskObj.xpReward)
      }));
    }
  };

  const handleBuyStreakFreeze = () => {
    if (gamification.xp < 50) {
      alert("❌ Insufficient XP: You need at least 50 XP to purchase a Streak Freeze shield. Complete scheduled revision checkpoints to accumulate more XP!");
      return;
    }

    setGamification(prev => {
      const currentFreezes = prev.streakFreezes || 0;
      return {
        ...prev,
        xp: Math.max(0, prev.xp - 50),
        streakFreezes: currentFreezes + 1
      };
    });
    alert("❄️ Streak Freeze acquired successfully! 50 XP deducted from your consistency index. This shield will be automatically consumed if you miss a revision day.");
  };

  const handleApplyRecoveryPlan = (rescheduledTasks: any[], motivationText: string) => {
    const today = new Date('2026-06-16');
    
    // Convert offsets to ISO dates
    const formattedRecoveryTasks = rescheduledTasks.map((t, idx) => {
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + (t.daysOffset || 1));
      const dateStr = scheduledDate.toISOString().split('T')[0];

      return {
        id: `recovery-${Date.now()}-${idx}`,
        title: t.title,
        description: t.description,
        subject: t.subject || 'General',
        duration: t.duration || 25,
        date: dateStr,
        completed: false,
        isRecovery: true,
        type: 'session' as const,
        xpReward: t.xpReward || 12
      };
    });

    // Append newly rescheduled items, delete previous missed tasks
    setTasks(prev => {
      const filtered = prev.filter(t => !t.missed);
      return [...filtered, ...formattedRecoveryTasks];
    });

    // Re-verify the tab
    setGamification(prev => ({
      ...prev,
      xp: prev.xp + 15 // recovery incentive bonus
    }));
  };

  const handleResetProfile = () => {
    if (confirm("Are you sure you want to completely reset your profile, stats, and custom tasks?")) {
      localStorage.clear();
      setProfile(null);
      setGamification({ xp: 120, level: 1, streak: 2, badges: ['Beginner'] });
      setTasks([]);
      setNotes([]);
      setActiveTab('dashboard');
    }
  };

  // --- Computed Backlogs ---
  const missedTasks = tasks.filter(t => !t.completed && (t.missed || new Date(t.date) < new Date('2026-06-16')));

  // --- Rendering Conditional Branches ---
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#1E293B] relative overflow-hidden text-slate-100 flex items-center justify-center">
        {/* Glow Spheres */}
        <div className="absolute top-[20%] left-[10%] w-[450px] h-[450px] bg-indigo-500/10 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] bg-cyan-500/10 blur-[130px] rounded-full"></div>
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // Common colors styled per theme modes
  const isLight = themeMode === 'light';
  const backgroundTheme = isLight 
    ? 'bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] text-slate-900' 
    : 'bg-gradient-to-br from-[#0F172A] via-[#111827] to-[#1E293B] text-slate-50';

  const cardGlassClass = isLight 
    ? 'bg-white border border-[#E2E8F0] shadow-md text-[#1E293B]' 
    : 'bg-white/5 border border-white/10 shadow-lg text-slate-100';

  const navItemClass = (tab: typeof activeTab) => {
    const isActive = activeTab === tab;
    if (isActive) {
      return `flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
        isLight ? 'bg-indigo-600 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
      }`;
    }
    return `flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition ${
      isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;
  };

  return (
    <div className={`min-h-screen ${backgroundTheme} transition duration-300 relative pb-16`}>
      {/* Outer ambient details */}
      {!isLight && (
        <>
          <div className="absolute top-[10%] left-[25%] w-[350px] h-[350px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-[13%] right-[25%] w-[350px] h-[350px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        </>
      )}

      {/* HEADER BAR */}
      <header className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-sans bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Anti-Procrastination Expert
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Welcome back, Student • Active Focus Console
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick timer toggle */}
          <button
            onClick={() => setShowPomodoroPanel(!showPomodoroPanel)}
            className="p-2 bg-gradient-to-tr from-indigo-500/10 to-pink-500/10 hover:from-indigo-500/20 hover:to-pink-500/20 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-300 text-xs font-semibold gap-1.5 transition"
          >
            <Clock className="w-4 h-4 animate-spin-slow" />
            <span>Study Loop</span>
          </button>

          {/* AI Tutor Chat Trigger */}
          <button
            onClick={() => setShowStudyChat(!showStudyChat)}
            className="p-2 bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-300 text-xs font-semibold gap-1.5 transition select-none"
            title="Chat with your Expert Parent AI Tutor"
          >
            <Bot className="w-4 h-4 animate-pulse text-cyan-400" />
            <span>AI Tutor</span>
          </button>

          {/* Export dossier report */}
          <ExportDossier 
            profile={profile} 
            tasks={tasks} 
            gamification={gamification} 
            notes={notes} 
          />

          {/* Theme switcher */}
          <button
            onClick={() => setThemeMode(isLight ? 'dark' : 'light')}
            className={`p-2.5 rounded-xl border transition ${
              isLight ? 'bg-slate-200 border-slate-300 text-slate-800 hover:bg-slate-300' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Light & Dark Mode"
          >
            {isLight ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5" />}
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetProfile}
            className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
              isLight ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' : 'bg-rose-500/5 border-rose-500/10 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
            }`}
            title="Clear saved progress"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6 relative z-10 space-y-6">
        
        {/* Navigation Ribbon */}
        <nav className="flex flex-wrap items-center justify-around md:justify-start gap-1 p-1 bg-slate-950/20 border border-white/5 rounded-2xl w-fit">
          <button onClick={() => setActiveTab('dashboard')} className={navItemClass('dashboard')}>
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden md:inline">Dashboard</span>
          </button>
          
          <button onClick={() => setActiveTab('calendar')} className={navItemClass('calendar')}>
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden md:inline">Revision Calendar</span>
          </button>

          <button onClick={() => setActiveTab('notes')} className={navItemClass('notes')}>
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">Cheat Notes</span>
          </button>

          <button onClick={() => setActiveTab('analytics')} className={navItemClass('analytics')}>
            <TrendingUp className="w-4 h-4" />
            <span className="hidden md:inline">Consistency Analytics</span>
          </button>

          <button onClick={() => setActiveTab('recovery')} className={navItemClass('recovery')}>
            <HeartHandshake className="w-4 h-4" />
            <span className="hidden md:inline">Recovery Plan</span>
            {missedTasks.length > 0 && (
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping shrink-0" />
            )}
          </button>

          <button onClick={() => setActiveTab('notifications')} className={navItemClass('notifications')}>
            <Bell className="w-4 h-4" />
            <span className="hidden md:inline">Notifications</span>
          </button>
        </nav>

        {/* PERSISTENT ALERT FOR MISSED STUDY DAYS */}
        {missedTasks.length > 0 && activeTab !== 'recovery' && (
          <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5 shrink-0 animate-bounce" />
              <div>
                <span className="text-xs font-bold text-slate-200">You have {missedTasks.length} backlog task alerts!</span>
                <p className="text-[11px] text-slate-400 mt-0.5">We detected unfinished study blocks due on recent calendar days. Don't worry or feel guilty!</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('recovery')}
              className="px-4 py-1.5 bg-purple-700 hover:bg-purple-600 text-white font-semibold text-xs rounded-xl transition"
            >
              Get Custom Recovery Plan
            </button>
          </div>
        )}

        {/* POMODORO FLOATING OVERLAY PANEL CONTROLLER */}
        {showPomodoroPanel && (
          <div className="p-1 rounded-2xl border border-indigo-400/20 shadow-2xl relative bg-slate-900/15">
            <PomodoroTimer 
              activeTask={currentPomodoroTask} 
              onSessionComplete={handleSessionComplete} 
              focusTips={profile.focusTips || []} 
            />
            <button 
              onClick={() => setShowPomodoroPanel(false)}
              className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 bg-white/5 border border-white/5 rounded-md"
            >
              Minimize [×]
            </button>
          </div>
        )}

        {/* TAB WORKSPACES */}
        <div className="tab-viewport min-h-[450px]">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <DashboardOverview 
                profile={profile} 
                stats={gamification} 
                tasks={tasks.filter(t => t.date === '2026-06-16')} 
                onStartPomodoro={handleStartPomodoro}
                onQuickToggleComplete={handleQuickToggleComplete}
                onBuyStreakFreeze={handleBuyStreakFreeze}
                onOpenBadgesGallery={() => setShowBadgesGallery(true)}
                onUpdateTaskPriority={handleUpdateTaskPriority}
              />
              <CountdownsWidget customExamDate={profile.examDate} />
            </div>
          )}

          {activeTab === 'calendar' && (
            <CalendarView 
              tasks={tasks} 
              subjects={profile.subjects} 
              onAddTask={handleAddTask} 
              onMoveTask={handleMoveTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'notes' && (
            <NotesSection 
              notes={notes} 
              subjects={profile.subjects} 
              onAddNote={handleAddNote} 
              onUpdateNote={handleUpdateNote} 
              onDeleteNote={handleDeleteNote}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPanel 
              tasks={tasks} 
              subjects={profile.subjects} 
            />
          )}

          {activeTab === 'recovery' && (
            <RecoveryPlanner 
              missedTasks={missedTasks} 
              onApplyRecoveryPlan={handleApplyRecoveryPlan} 
              subjects={profile.subjects} 
            />
          )}
        </div>

        {/* UNIFIED GLOBAL STUDY NOTIFICATION CONTROLLER PORT */}
        <NotificationManager tasks={tasks} isVisible={activeTab === 'notifications'} />

      </main>

      {/* Dynamic Flying Assist Button */}
      <button
        onClick={() => setShowStudyChat(!showStudyChat)}
        className="fixed bottom-6 right-6 z-[45] p-3.5 bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none flex items-center justify-center cursor-pointer"
        title="Open AI Study Coach"
      >
        <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
        <span className="max-w-0 overflow-hidden text-[10px] font-bold uppercase tracking-wider group-hover:max-w-xs transition-all duration-500 whitespace-nowrap ml-0 group-hover:ml-1.5 opacity-0 group-hover:opacity-100">
          Coach
        </span>
      </button>

      {/* Slide-out Sidebar Drawer */}
      <StudyCopilotChat 
        profile={profile}
        tasks={tasks}
        notes={notes}
        gamification={gamification}
        isLight={isLight}
        isOpen={showStudyChat}
        onClose={() => setShowStudyChat(false)}
      />

      {/* Interactive Badges Gallery Modal Display */}
      <BadgesGalleryModal 
        stats={gamification}
        isOpen={showBadgesGallery}
        onClose={() => setShowBadgesGallery(false)}
      />
    </div>
  );
}
