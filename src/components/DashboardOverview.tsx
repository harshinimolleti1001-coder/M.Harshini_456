import React, { useState } from 'react';
import { StudentProfile, GamificationState, StudyTask } from '../types';
import { Award, Flame, Star, CheckCircle, Clock, AlertTriangle, Play, Sparkles, LayoutGrid, CheckSquare } from 'lucide-react';
import EisenhowerMatrixView from './EisenhowerMatrixView';

interface DashboardOverviewProps {
  profile: StudentProfile;
  stats: GamificationState;
  tasks: StudyTask[];
  onStartPomodoro: (task: StudyTask) => void;
  onQuickToggleComplete: (taskId: string) => void;
  onBuyStreakFreeze: () => void;
  onOpenBadgesGallery: () => void;
  onUpdateTaskPriority?: (taskId: string, updates: { urgent?: boolean; important?: boolean }) => void;
}

export default function DashboardOverview({
  profile,
  stats,
  tasks,
  onStartPomodoro,
  onQuickToggleComplete,
  onBuyStreakFreeze,
  onOpenBadgesGallery,
  onUpdateTaskPriority
}: DashboardOverviewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
  
  // Compute basic stats
  const completedToday = tasks.filter(t => t.completed).length;
  const totalTasksToday = tasks.length;
  const completionPercentage = totalTasksToday > 0 
    ? Math.round((completedToday / totalTasksToday) * 100) 
    : 0;

  const currentLevelXpNeeded = stats.level * 100;
  const levelProgress = stats.xp % 100;

  // Next critical deadline
  const daysUntilExam = React.useMemo(() => {
    const examDate = new Date(profile.examDate);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [profile.examDate]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / AI Procrastination profile */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900/40 to-indigo-950/40 border border-white/10 dark:bg-slate-900/20 backdrop-blur-md rounded-[20px] shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/5 blur-3xl rounded-full"></div>
        
        <div className="relative space-y-3 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            AI Diagnostic Profile
          </div>
          <h2 className="text-2xl font-bold text-slate-100 flex flex-wrap items-center justify-center md:justify-start gap-2">
            You are classified as <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">{profile.procrastinationType}</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            {profile.procrastinationAnalysis}
          </p>
          
          <div className="pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">Tailored Expert Focus Strategy:</h4>
            <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
              {profile.focusTips?.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Current Attendance Indicator (near 75% focus) */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl w-full md:w-auto md:min-w-[220px] text-center md:text-left flex flex-col items-center md:items-start justify-center backdrop-blur-xl relative">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Attendance Status</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-4xl font-bold tracking-tight ${profile.attendancePercentage < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {profile.attendancePercentage}%
            </span>
            <span className="text-xs text-slate-500">of 100%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${profile.attendancePercentage < 75 ? 'bg-amber-400' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min(profile.attendancePercentage, 100)}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 text-center md:text-left">
            {profile.attendancePercentage < 75 
              ? "⚠️ Under 75% Minimum requirement! Boost attendance soon!"
              : "⭐ Above critical threshold. Keep attending lectures!"}
          </span>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Streak card with protections store */}
        <div className="bg-white/5 hover:bg-white/8 transition-all duration-300 border border-white/10 p-5 rounded-[20px] backdrop-blur-md relative overflow-hidden flex flex-col justify-between group min-h-[142px]">
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300 relative">
              <Flame className="w-7 h-7" />
              {(stats.streakFreezes || 0) > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-extrabold animate-pulse" title={`${stats.streakFreezes} active protections`}>
                  ❄️
                </span>
              )}
            </div>
            <div>
              <span className="text-xs text-slate-400 block tracking-wide font-medium uppercase">Active Streak</span>
              <span className="text-2xl font-bold text-slate-100 block">{stats.streak} {stats.streak === 1 ? 'Day' : 'Days'}</span>
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-1 border-t border-white/5 pt-1.5 w-full">
            <div className="flex justify-between items-center text-[11px] gap-2">
              <span className="text-slate-400 flex items-center gap-1 shrink-0">
                ❄️ Freezes: <strong className="text-cyan-300 font-bold">{stats.streakFreezes || 0}</strong>
              </span>
              <button 
                onClick={onBuyStreakFreeze}
                className="px-2.5 py-0.5 bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-400/20 text-[9px] font-bold text-cyan-300 rounded uppercase transition cursor-pointer shrink-0"
                title="Spend 50 XP to buy a streak protection shield"
              >
                Buy (50 XP)
              </button>
            </div>
            <span className="text-[10px] text-amber-400 font-medium block truncate">
              {stats.streak >= 3 ? '🔥 Streak multiplier active! +10% XP' : '⚠️ Keep studying to build multiplier'}
            </span>
          </div>
        </div>

        {/* Level card */}
        <div className="bg-white/5 hover:bg-white/8 transition-all duration-300 border border-white/10 p-5 rounded-[20px] backdrop-blur-md relative overflow-hidden flex flex-col justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block tracking-wide font-medium uppercase">Current Level</span>
              <span className="text-2xl font-bold text-slate-100 block">Lvl {stats.level}</span>
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{levelProgress} / 100 XP</span>
              <span>Next Level</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Total XP Card */}
        <div className="bg-white/5 hover:bg-white/8 transition-all duration-300 border border-white/10 p-5 rounded-[20px] backdrop-blur-md relative overflow-hidden flex items-center gap-4 group">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
            <Star className="w-7 h-7 animate-spin-slow" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block tracking-wide font-medium uppercase">Total Accumulated XP</span>
            <span className="text-2xl font-bold text-slate-100 block">{stats.xp} XP</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Need {100 - levelProgress} XP for Level Up</span>
          </div>
        </div>

        {/* Countdown card */}
        <div className="bg-white/5 hover:bg-white/8 transition-all duration-300 border border-white/10 p-5 rounded-[20px] backdrop-blur-md relative overflow-hidden flex items-center gap-4 group">
          <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform duration-300">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block tracking-wide font-medium uppercase">Days to Exams</span>
            <span className="text-2xl font-bold text-slate-100 block">{daysUntilExam} Days</span>
            <span className="text-[10px] text-pink-400 font-medium block mt-0.5">Date: {profile.examDate}</span>
          </div>
        </div>
      </div>

      {/* Gamification Badges Section */}
      <div className="p-5 bg-white/5 border border-white/10 rounded-[20px] backdrop-blur-md space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-sm font-semibold tracking-wide text-slate-300 flex items-center gap-2 uppercase">
            <Award className="w-5 h-5 text-indigo-400" /> My Badges ({stats.badges.length})
          </h3>
          <button
            onClick={onOpenBadgesGallery}
            className="px-3.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-400/20 text-[11px] font-bold text-indigo-300 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            title="Open Interactive Achievements Gallery"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Badges Gallery</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-4">
          {stats.badges.includes('Beginner') && (
            <div className="flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide hover:bg-indigo-500/20 transition duration-300 cursor-default">
              <Star className="w-4.5 h-4.5 text-indigo-400" />
              <span>Beginner (App onboarding complete)</span>
            </div>
          )}

          {stats.badges.includes('Consistent learner') && (
            <div className="flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold tracking-wide hover:bg-blue-500/20 transition duration-300 cursor-default">
              <Flame className="w-4.5 h-4.5 text-blue-400" />
              <span>Consistent Learner (Streak &ge; 3 days)</span>
            </div>
          )}
          
          {stats.badges.includes('Top learner') && (
            <div className="flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-semibold tracking-wide hover:bg-pink-500/20 transition duration-300 cursor-default">
              <Award className="w-4.5 h-4.5 text-pink-400 animate-bounce" />
              <span>Top Learner (Earned 400+ Total XP)</span>
            </div>
          )}
          {stats.badges.length === 0 && (
            <p className="text-xs text-slate-500 italic">No badges unlocked yet. Start check listing tasks to level up!</p>
          )}
        </div>
      </div>

      {/* Task View Mode Switcher */}
      <div className="flex items-center justify-between bg-white/5 border border-white/10 p-2.5 rounded-[20px] flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1 px-2.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-[10px] uppercase tracking-[0.12em] text-indigo-400 font-extrabold font-mono">
            Task Orchestrator
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Analyze cognitive load vectors or execute simple checklists.</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-300 flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>List Checklist</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition duration-300 flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'matrix'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Eisenhower Matrix</span>
          </button>
        </div>
      </div>

      {/* Todays Micro Checklist with inline triggers OR Eisenhower Matrix */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checklist */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6 rounded-[20px] backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                  <CheckCircle className="w-5 h-5 text-indigo-400" /> Today's Micro Checklist
                </h3>
                <p className="text-xs text-slate-400">Complete tasks to earn +10 XP. Start a 25m Pomodoro Study Block.</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-cyan-400">{completedToday} / {totalTasksToday}</span>
                <span className="text-xs text-slate-500 block">Completed</span>
              </div>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>

            <div className="space-y-3 pt-2">
              {tasks.length === 0 ? (
                <div className="text-center py-8 bg-white/2 p-4 rounded-xl border border-white/5">
                  <p className="text-sm text-slate-400">No study microtasks scheduled for today.</p>
                  <p className="text-xs text-slate-500 mt-1">Go to the Calendar/planner to break down subjects into Pomodoro tasks!</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                      task.completed 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400' 
                        : task.isRecovery 
                          ? 'bg-purple-500/5 border-purple-500/20 hover:bg-purple-500/10'
                          : 'bg-white/2 hover:bg-white/5 border-white/5'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <button 
                        onClick={() => onQuickToggleComplete(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-400 transition duration-150 flex-shrink-0"
                      >
                        <div className={`w-5 h-5 border rounded-md flex items-center justify-center ${task.completed ? 'bg-emerald-500 border-emerald-500 text-slate-900' : 'border-white/30'}`}>
                          {task.completed && <CheckCircle className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-semibold tracking-tight ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                            {task.title}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-slate-800 border border-slate-700 text-cyan-400 rounded-md">
                            {task.subject}
                          </span>
                          {task.isRecovery && (
                            <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-md">
                              Recovery Plan
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 hidden sm:inline">+{task.xpReward} XP</span>
                      {!task.completed && (
                        <button 
                          onClick={() => onStartPomodoro(task)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/20 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 active:scale-95 transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Focus
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Deadline Warnings and Notifications right away */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-[20px] backdrop-blur-md flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Smart Deadline Alerts
              </h3>
              
              <div className="space-y-3">
                {/* Alert 1 */}
                <div className="p-3 bg-amber-500/5 hover:bg-amber-500/8 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-amber-300 text-slate-300">Minimum Attendance Check</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                      {profile.attendancePercentage < 75 
                        ? `At ${profile.attendancePercentage}%, you risk exam disqualification. Ensure you attend classes.`
                        : `You stand clean at ${profile.attendancePercentage}%. Maintain above 75% for exam safety.`}
                    </p>
                  </div>
                </div>

                {/* Alert 2 */}
                <div className="p-3 bg-indigo-500/5 hover:bg-indigo-500/8 border border-indigo-500/20 rounded-xl flex items-start gap-2.5">
                  <Clock className="w-4.5 h-4.5 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-slate-300">Revision Pending</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                      Weekly reviews maintain recall memory retention up to 80% higher. Schedule a revision block today.
                    </p>
                  </div>
                </div>

                {/* Alert 3 */}
                <div className="p-3 bg-cyan-500/5 hover:bg-cyan-500/8 border border-cyan-500/20 rounded-xl flex items-start gap-2.5">
                  <Star className="w-4.5 h-4.5 text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-slate-300">Streak Status Alert</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                      {stats.streak > 0 
                        ? `Your active streak is ${stats.streak} days. Complete 1 microtask before UTC midnight or face streak loss!`
                        : "No active streak. Start studying today to lock in your daily streak bonus!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 mt-6 text-center">
              <span className="text-xs text-slate-500 italic block font-mono">
                GATE countdown & semester metrics synced.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[20px] backdrop-blur-md">
          <EisenhowerMatrixView 
            tasks={tasks}
            onStartPomodoro={onStartPomodoro}
            onQuickToggleComplete={onQuickToggleComplete}
            onUpdateTaskPriority={onUpdateTaskPriority}
          />
        </div>
      )}
    </div>
  );
}
