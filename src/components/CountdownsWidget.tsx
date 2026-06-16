import React, { useState } from 'react';
import { CountdownEvent } from '../types';
import { Calendar, Plus, Clock, Star, Sparkles, Trophy, Trash2 } from 'lucide-react';

interface CountdownsWidgetProps {
  customExamDate: string;
}

export default function CountdownsWidget({ customExamDate }: CountdownsWidgetProps) {
  // Preset milestones
  const [events, setEvents] = useState<CountdownEvent[]>([
    { id: '1', title: 'GATE Examination 2027', date: '2027-02-06', category: 'GATE' },
    { id: '2', title: 'University Semester Exams', date: customExamDate, category: 'Semester' },
    { id: '3', title: 'TCS & Google Placement Auditions', date: '2026-09-01', category: 'Placement' },
    { id: '4', title: 'Codeforces Grand Hackathon-Prep', date: '2026-06-25', category: 'Contest' },
  ]);

  // Form states to add custom timeline trackers
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventCat, setNewEventCat] = useState<'GATE' | 'Semester' | 'Contest' | 'Placement'>('Contest');
  const [showAddForm, setShowAddForm] = useState(false);

  // Sync customized exam date when changed
  React.useEffect(() => {
    setEvents(prev => prev.map(e => {
      if (e.id === '2') {
        return { ...e, date: customExamDate };
      }
      return e;
    }));
  }, [customExamDate]);

  // Compute remaining days relative to the current local date (2026-06-16)
  const getDaysRemaining = (targetDateStr: string) => {
    const today = new Date('2026-06-16');
    const target = new Date(targetDateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;

    const newEvent: CountdownEvent = {
      id: Date.now().toString(),
      title: newEventTitle,
      date: newEventDate,
      category: newEventCat
    };

    setEvents(prev => [...prev, newEvent]);
    setNewEventTitle('');
    setNewEventDate('');
    setShowAddForm(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // Badge styler based on category
  const getCategoryStyles = (cat: string) => {
    switch (cat) {
      case 'GATE':
        return 'bg-pink-500/10 border-pink-500/20 text-pink-300';
      case 'Semester':
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300';
      case 'Contest':
        return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300';
      default:
        return 'bg-amber-500/10 border-amber-500/20 text-amber-300';
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-[20px] shadow-xl backdrop-blur-md space-y-6 relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full"></div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5 uppercase">
            <Clock className="w-5 h-5 text-indigo-400" /> Exam & Placement Countdowns
          </h3>
          <p className="text-xs text-slate-400">Keep track of crucial milestones to simulate healthy urgency and beat hesitation.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl text-xs font-semibold text-indigo-300 flex items-center gap-1 transition"
        >
          <Plus className="w-4 h-4" /> Tracker
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddEvent} className="p-4 bg-slate-950 border border-white/5 rounded-xl space-y-4 animate-fade-in text-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Milestone (e.g. Codechef Contest, Google Prep)"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="p-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm"
              required
            />
            <input
              type="date"
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.target.value)}
              className="p-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm"
              required
            />
            <select
              value={newEventCat}
              onChange={(e) => setNewEventCat(e.target.value as any)}
              className="p-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-300"
            >
              <option value="GATE">GATE Exam</option>
              <option value="Semester">Semester Exams</option>
              <option value="Contest">Coding Contest</option>
              <option value="Placement">Placement Milestone</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 border border-white/10 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold"
            >
              Create Milestone
            </button>
          </div>
        </form>
      )}

      {/* Countdowm widget cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {events.map(ev => {
          const daysLeft = getDaysRemaining(ev.date);
          const isUrgent = daysLeft <= 14;

          return (
            <div 
              key={ev.id} 
              className={`p-5 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                isUrgent 
                  ? 'bg-rose-500/5 border-rose-500/20 shadow-md shadow-rose-500/5' 
                  : 'bg-white/2 hover:bg-white/5 border-white/5'
              }`}
            >
              {/* Event Decor lines */}
              <div className="absolute right-0 top-0 w-24 h-24 bg-white/1 bg-gradient-to-br from-indigo-500/10 to-transparent blur-2xl rounded-full"></div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getCategoryStyles(ev.category)}`}>
                    {ev.category === 'Contest' ? '🔒 CODING CONTEST' : ev.category === 'Placement' ? '🎯 PLACEMENT TIMELINE' : ev.category === 'GATE' ? '💎 GATE PREP' : '🏛️ SEMESTER TIMELINE'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-200 mt-2.5 group-hover:text-white transition">
                    {ev.title}
                  </h4>
                  <span className="text-xs text-slate-500 block mt-1 font-mono">Date: {ev.date}</span>
                </div>

                <div className="text-right">
                  <span className={`text-3xl font-bold font-mono tracking-tighter block ${
                    daysLeft === 0 
                      ? 'text-slate-500' 
                      : isUrgent 
                        ? 'text-rose-400 animate-pulse' 
                        : 'text-indigo-400 group-hover:text-cyan-400 transition'
                  }`}>
                    {daysLeft}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">Days Left</span>
                </div>
              </div>

              {/* Progress stress bar */}
              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  {daysLeft >= 30 ? (
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-pink-400" />
                  )}
                  {daysLeft === 0 
                    ? 'Goal Completed / Milestone Passed' 
                    : daysLeft < 7 
                      ? '🔥 Extreme Urgency! Study Now!' 
                      : daysLeft < 30 
                        ? '⚡ Under 1 month! Plan final papers.' 
                        : '🛡️ Safe margin. Build high streaks.'}
                </span>

                {/* Trash custom trackers */}
                {ev.id !== '1' && ev.id !== '2' && ev.id !== '3' && ev.id !== '4' && (
                  <button
                    onClick={() => handleDeleteEvent(ev.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                    title="Delete milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
