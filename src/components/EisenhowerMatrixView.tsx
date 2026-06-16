import React from 'react';
import { StudyTask } from '../types';
import { 
  CheckCircle, 
  Play, 
  Flame, 
  Star, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Zap, 
  TrendingUp, 
  Compass, 
  Moon, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface EisenhowerMatrixViewProps {
  tasks: StudyTask[];
  onStartPomodoro: (task: StudyTask) => void;
  onQuickToggleComplete: (taskId: string) => void;
  onUpdateTaskPriority?: (taskId: string, updates: { urgent?: boolean; important?: boolean }) => void;
}

export default function EisenhowerMatrixView({
  tasks,
  onStartPomodoro,
  onQuickToggleComplete,
  onUpdateTaskPriority
}: EisenhowerMatrixViewProps) {

  // Process and group tasks into the 4 quadrants
  // If a task doesn't have explicit flags, we can default them (e.g. mock tasks)
  // Let's analyze types: if task.urgent is undefined, let's treat it as:
  // - mock-1 (DBMS TransactionIsolation): important (true), urgent (true) (defaults for display)
  // - mock-2 (Heapsort Analysis): important (true), urgent (false)
  // - mock-3 (Process Scheduling past exam - missed): urgent (true), important (false)
  // - mock-4 (Mock Assessment-1): important (true), urgent (false)
  const getTaskUrgent = (task: StudyTask) => {
    if (task.urgent !== undefined) return task.urgent;
    // Sensible defaults based on subjects or names
    if (task.id === 'mock-1') return true;
    if (task.id === 'mock-3') return true;
    return false;
  };

  const getTaskImportant = (task: StudyTask) => {
    if (task.important !== undefined) return task.important;
    if (task.id === 'mock-1') return true;
    if (task.id === 'mock-2') return true;
    if (task.id === 'mock-4') return true;
    return false;
  };

  // Quadrant 1: Urgent & Important (Do First)
  const q1Tasks = tasks.filter(t => getTaskUrgent(t) && getTaskImportant(t));

  // Quadrant 2: Important & Not Urgent (Schedule / Plan)
  const q2Tasks = tasks.filter(t => !getTaskUrgent(t) && getTaskImportant(t));

  // Quadrant 3: Urgent & Not Important (Delegate / Limit)
  const q3Tasks = tasks.filter(t => getTaskUrgent(t) && !getTaskImportant(t));

  // Quadrant 4: Neither (Postpone / De-emphasize)
  const q4Tasks = tasks.filter(t => !getTaskUrgent(t) && !getTaskImportant(t));

  const handleToggleUrgent = (task: StudyTask) => {
    if (onUpdateTaskPriority) {
      onUpdateTaskPriority(task.id, { urgent: !getTaskUrgent(task) });
    }
  };

  const handleToggleImportant = (task: StudyTask) => {
    if (onUpdateTaskPriority) {
      onUpdateTaskPriority(task.id, { important: !getTaskImportant(task) });
    }
  };

  const renderTaskItem = (task: StudyTask) => {
    const isUrgent = getTaskUrgent(task);
    const isImportant = getTaskImportant(task);

    return (
      <div 
        key={task.id} 
        className={`p-3 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between gap-2.5 ${
          task.completed 
            ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-500 opacity-60' 
            : 'bg-slate-900/60 hover:bg-slate-900/80 border-white/5 hover:border-white/10'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[11px] font-bold tracking-tight line-clamp-2 ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {task.title}
              </span>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-slate-800/80 border border-slate-700/50 text-cyan-400 rounded-md shrink-0">
                {task.subject}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-normal line-clamp-2">{task.description}</p>
        </div>

        {/* Quadrant Controls & Actions */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
          <div className="flex items-center gap-1">
            {/* Quick parameter togglers */}
            <button
              onClick={() => handleToggleUrgent(task)}
              className={`p-1 rounded text-[9px] font-bold tracking-widest uppercase transition-colors shrink-0 ${
                isUrgent 
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
              title="Toggle Urgency classification"
            >
              🔥 Urgent
            </button>
            <button
              onClick={() => handleToggleImportant(task)}
              className={`p-1 rounded text-[9px] font-bold tracking-widest uppercase transition-colors shrink-0 ${
                isImportant 
                  ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
              title="Toggle Importance classification"
            >
              💎 Important
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Completion Button */}
            <button 
              onClick={() => onQuickToggleComplete(task.id)}
              className={`p-1 rounded-lg transition-colors ${
                task.completed 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-white/5 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400'
              }`}
              title={task.completed ? "Mark Uncompleted" : "Complete Task (+10 XP)"}
            >
              <CheckCircle className="w-4 h-4" />
            </button>

            {/* Launch Focus/Pomodoro Button */}
            {!task.completed && (
              <button 
                onClick={() => onStartPomodoro(task)}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-transform active:scale-95 flex items-center justify-center shrink-0"
                title="Launch study focus timer"
              >
                <Play className="w-3 h-3 fill-current" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderQuadrantEmptyState = (label: string) => (
    <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-950/20 rounded-2xl border border-dashed border-white/5 min-h-[140px]">
      <span className="text-slate-500 text-[11px] italic">No active tasks in this quadrant.</span>
      <span className="text-[10px] text-slate-600 mt-1">Adjust other task toggles or schedule revision subjects to populate matrix cells.</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Header advisory info */}
      <div className="p-4.5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-indigo-400 uppercase tracking-widest block bg-indigo-500/15 border border-indigo-400/20 px-2 py-0.5 rounded-md">Advisory</span>
            <h3 className="text-sm font-bold text-slate-200">The Eisenhower Matrix</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            This matrix maps cognitive revision loads across two orthogonal vectors: **Urgency** (requires fast reactivity/timed constraints) and **Importance** (advances major study milestones / exams). Keep the upper-left quadrant clean first!
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/25">Urgency vector: 🔥</span>
          <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/25">Importance vector: 💎</span>
        </div>
      </div>

      {/* Grid structure of matrix quadrants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Intersection marker overlay for beautiful visualization details */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-slate-900 border border-white/10 items-center justify-center text-indigo-400 shadow-xl z-10 font-bold text-[10px]">
          MATRIX
        </div>

        {/* Quadrant 1: DO FIRST (Urgent & Important) */}
        <div className="p-5.5 bg-gradient-to-tr from-rose-950/15 via-slate-900/40 to-slate-900/40 border border-rose-500/20 rounded-[24px] space-y-4 hover:border-rose-500/30 transition duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/[0.02] blur-3xl rounded-full"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 font-extrabold text-sm shadow-inner">
                Q1
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Do First (Urgent & Important)</h4>
                <span className="text-[10px] text-rose-400 font-medium block uppercase tracking-wide">🔥 Immediate Academic Crisis</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 px-2 py-0.5 bg-rose-500/5 rounded-full border border-rose-500/10">
              {q1Tasks.length} tasks
            </span>
          </div>

          <div className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-thin pr-1.5">
            {q1Tasks.length === 0 ? renderQuadrantEmptyState("Do First") : q1Tasks.map(renderTaskItem)}
          </div>
        </div>

        {/* Quadrant 2: SCHEDULE (Important but Not Urgent) */}
        <div className="p-5.5 bg-gradient-to-tr from-indigo-950/15 via-slate-900/40 to-slate-900/40 border border-indigo-500/20 rounded-[24px] space-y-4 hover:border-indigo-500/30 transition duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.02] blur-3xl rounded-full"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-extrabold text-sm shadow-inner">
                Q2
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Plan / Schedule (Important, Not Urgent)</h4>
                <span className="text-[10px] text-indigo-400 font-medium block uppercase tracking-wide">💎 Depth Mastery / Goal Blocks</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 bg-indigo-500/5 rounded-full border border-indigo-500/10">
              {q2Tasks.length} tasks
            </span>
          </div>

          <div className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-thin pr-1.5">
            {q2Tasks.length === 0 ? renderQuadrantEmptyState("Plan") : q2Tasks.map(renderTaskItem)}
          </div>
        </div>

        {/* Quadrant 3: DELEGATE / LIMIT (Urgent but Not Important) */}
        <div className="p-5.5 bg-gradient-to-tr from-amber-950/15 via-slate-900/40 to-slate-900/40 border border-amber-500/20 rounded-[24px] space-y-4 hover:border-amber-500/30 transition duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/[0.02] blur-3xl rounded-full"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-extrabold text-sm shadow-inner">
                Q3
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Limit / Handle (Urgent, Not Important)</h4>
                <span className="text-[10px] text-amber-400 font-medium block uppercase tracking-wide">⏳ Chore / Administrative Tasks</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 bg-amber-500/5 rounded-full border border-amber-500/10">
              {q3Tasks.length} tasks
            </span>
          </div>

          <div className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-thin pr-1.5">
            {q3Tasks.length === 0 ? renderQuadrantEmptyState("Delegate") : q3Tasks.map(renderTaskItem)}
          </div>
        </div>

        {/* Quadrant 4: POSTPONE (Neither Urgent nor Important) */}
        <div className="p-5.5 bg-gradient-to-tr from-slate-950/20 via-slate-900/40 to-slate-900/40 border border-white/10 rounded-[24px] space-y-4 hover:border-white/15 transition duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] blur-3xl rounded-full"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-extrabold text-sm shadow-inner">
                Q4
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Postpone / Drop (Neither)</h4>
                <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wide">💤 Low Leverage distractions</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 px-2 py-0.5 bg-slate-800/10 rounded-full border border-white/5">
              {q4Tasks.length} tasks
            </span>
          </div>

          <div className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-thin pr-1.5">
            {q4Tasks.length === 0 ? renderQuadrantEmptyState("Postpone") : q4Tasks.map(renderTaskItem)}
          </div>
        </div>
      </div>
    </div>
  );
}
