import React, { useState } from 'react';
import { StudyTask, TaskType } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface CalendarViewProps {
  tasks: StudyTask[];
  subjects: string[];
  onAddTask: (task: Omit<StudyTask, 'id'>) => void;
  onMoveTask: (taskId: string, targetDate: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function CalendarView({
  tasks,
  subjects,
  onAddTask,
  onMoveTask,
  onDeleteTask,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // Custom Task Creator Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskSubject, setTaskSubject] = useState(subjects[0] || 'General');
  const [taskType, setTaskType] = useState<TaskType>('session');
  const [taskUrgent, setTaskUrgent] = useState(true);
  const [taskImportant, setTaskImportant] = useState(true);
  
  // AI Split Chapter states
  const [showAIModal, setShowAIModal] = useState(false);
  const [chapterInput, setChapterInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Drag and Drop implementation
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onMoveTask(taskId, dateStr);
    }
    setDraggedTaskId(null);
  };

  // Add Custom Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !selectedDate) return;

    onAddTask({
      title: taskTitle,
      description: taskDesc || 'No details provided.',
      subject: taskSubject,
      duration: 25,
      date: selectedDate,
      completed: false,
      type: taskType,
      xpReward: taskType === 'mock_test' ? 30 : taskType === 'revision' ? 15 : 10,
      urgent: taskUrgent,
      important: taskImportant,
    });

    // Reset
    setTaskTitle('');
    setTaskDesc('');
    setTaskUrgent(true);
    setTaskImportant(true);
    setShowAddModal(false);
  };

  // Prompt backend to split a chapter into 4-5 micro Pomodoros on selectedDate
  const handleAISplitChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterInput || !selectedDate) return;
    setAiLoading(true);

    try {
      const response = await fetch('/api/break-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterName: chapterInput,
          subject: taskSubject
        })
      });

      if (!response.ok) throw new Error('AI split service failed');
      const data = await response.json();
      
      if (data.tasks && Array.isArray(data.tasks)) {
        data.tasks.forEach((item: any) => {
          onAddTask({
            title: item.title,
            description: item.description,
            subject: taskSubject,
            duration: item.duration || 25,
            date: selectedDate,
            completed: false,
            type: 'session',
            xpReward: item.xpReward || 10
          });
        });
      }
      
      setChapterInput('');
      setShowAIModal(false);
    } catch (err) {
      console.error(err);
      // Fallback
      alert('Could not reach server. Added standard Pomodoro study tasks instead.');
    } finally {
      setAiLoading(false);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Map tasks to dates for rendering
  const getTasksForDate = (dateStr: string) => {
    return tasks.filter(t => t.date === dateStr);
  };

  // Format Helper
  const formatCellDate = (dayNum: number): string => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(dayNum).padStart(2, '0');
    return `${year}-${formattedMonth}-${formattedDay}`;
  };

  const daysArr = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => null);
  const cellBlocks = [...blankDays, ...daysArr];

  // Icon / color mapping by task types
  const getTypeStyles = (type: TaskType) => {
    switch (type) {
      case 'deadline':
        return 'bg-pink-500/10 border-pink-500/30 text-pink-300';
      case 'revision':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-300';
      case 'mock_test':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
      default:
        return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300';
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-[20px] shadow-xl backdrop-blur-md p-6 relative">
      {/* Header Month Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-1.5 font-sans tracking-tight">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-400">Drag & drop tasks between dates to reschedule them.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevMonth}
            className="p-2 sm:p-2.5 hover:bg-white/5 dark:hover:bg-slate-800 border border-white/10 rounded-xl transition text-slate-300 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4.5 py-2.5 hover:bg-white/5 dark:hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-semibold text-slate-300 transition hover:text-white"
          >
            Today
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-2 sm:p-2.5 hover:bg-white/5 dark:hover:bg-slate-800 border border-white/10 rounded-xl transition text-slate-300 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-semibold tracking-wider text-slate-400 border-b border-white/5 pb-2 uppercase mb-1">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Cells Grid */}
      <div className="grid grid-cols-7 gap-1 border border-white/10 rounded-xl overflow-hidden bg-slate-950/20">
        {cellBlocks.map((dayNum, cellIdx) => {
          if (dayNum === null) {
            return (
              <div 
                key={`empty-${cellIdx}`} 
                className="min-h-[110px] bg-slate-950/5 border border-white/5/5 opacity-40 text-transparent"
              >
                -
              </div>
            );
          }

          const cellDateStr = formatCellDate(dayNum);
          const dailyTasks = getTasksForDate(cellDateStr);
          const isToday = cellDateStr === String(new Date().toISOString().split('T')[0]);

          return (
            <div
              key={`day-${dayNum}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, cellDateStr)}
              className={`min-h-[120px] p-2 border border-white/5 flex flex-col justify-between transition-all relative group cursor-default ${
                isToday 
                  ? 'bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-500/30' 
                  : 'hover:bg-white/2 bg-slate-900/10'
              }`}
            >
              {/* Date square number header */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold rounded-full w-5.5 h-5.5 flex items-center justify-center font-mono ${
                  isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25' : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {dayNum}
                </span>

                {/* Hover Quick actions */}
                <div className="opacity-0 group-hover:opacity-100 transition duration-150 flex gap-1">
                  <button 
                    onClick={() => {
                      setSelectedDate(cellDateStr);
                      setShowAddModal(true);
                    }}
                    title="Add Study Task"
                    className="p-1 rounded-md bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedDate(cellDateStr);
                      setShowAIModal(true);
                    }}
                    title="AI Chapter Split"
                    className="p-1 rounded-md bg-indigo-950 hover:bg-indigo-900 text-indigo-300"
                  >
                    <Sparkles className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Tasks List inside cellar */}
              <div className="flex-1 mt-2.5 space-y-1 overflow-y-auto max-h-[85px] scrollbar-thin">
                {dailyTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className={`px-2 py-1 text-[10px] rounded-md border font-normal flex items-center justify-between gap-1 select-none transition ${getTypeStyles(task.type)} ${
                      task.completed ? 'opacity-40 line-through' : 'cursor-grab active:cursor-grabbing hover:brightness-110 shadow-sm'
                    }`}
                  >
                    <span className="truncate flex-1 font-medium">{task.title}</span>
                    <button 
                      onClick={() => onDeleteTask(task.id)}
                      className="text-slate-500 hover:text-rose-400 opacity-0 group-hover/task hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Types Legend */}
      <div className="flex flex-wrap gap-4 mt-4 text-[11px] text-slate-400 font-medium font-sans">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-indigo-500/10 border border-indigo-500/40"></span>
          <span>Study Sessions (Pomodoro)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-pink-500/10 border border-pink-500/40"></span>
          <span>Core Deadlines</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-500/10 border border-amber-500/40"></span>
          <span>Revision Chapters</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500/10 border border-emerald-500/40"></span>
          <span>Mock Tests</span>
        </div>
      </div>

      {/* ADD MODAL CONTAINER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-indigo-400" /> Plan Custom Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input
                type="text"
                placeholder="Task Title (e.g., Study Deadlock Avoidance)"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />
              <textarea
                placeholder="Description/Objectives..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-slate-200 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Subject</label>
                  <select
                    value={taskSubject}
                    onChange={(e) => setTaskSubject(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-slate-300 text-sm"
                  >
                    {subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="Placement">Placement Prep</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Block Type</label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as TaskType)}
                    className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-slate-300 text-sm"
                  >
                    <option value="session">Study Block</option>
                    <option value="deadline">Core Deadline</option>
                    <option value="revision">Revision Block</option>
                    <option value="mock_test">Mock Test</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-6 p-3.5 bg-white/5 border border-white/5 rounded-xl">
                <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={taskUrgent}
                    onChange={(e) => setTaskUrgent(e.target.checked)}
                    className="rounded border-white/20 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
                  />
                  <span>🔥 Brand as Urgent</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={taskImportant}
                    onChange={(e) => setTaskImportant(e.target.checked)}
                    className="rounded border-white/20 bg-slate-950 text-indigo-500 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
                  />
                  <span>💎 Make Important</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4.5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI SPLIT MODAL CONTAINER */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>

            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 relative">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" /> AI Microtask Segmenter
            </h3>
            <p className="text-xs text-slate-400 mt-1 relative">
              Give Gemini a complex chapter name. It will break it down into four 25-minute Pomodoro study segments.
            </p>

            <form onSubmit={handleAISplitChapter} className="space-y-4 mt-4 relative">
              <input
                type="text"
                placeholder="Chapter name (e.g., B+ Trees Insertion, ACID Transactions)"
                value={chapterInput}
                onChange={(e) => setChapterInput(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                required
              />

              <div>
                <label className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Assign to Subject</label>
                <select
                  value={taskSubject}
                  onChange={(e) => setTaskSubject(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-slate-300 text-sm"
                >
                  {subjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="General">General</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  className="px-4.5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-sm"
                  disabled={aiLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold text-sm flex items-center gap-1.5"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Splitting chapters...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Pomodoro Checklist
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
