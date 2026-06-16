import React, { useState } from 'react';
import { StudyTask } from '../types';
import { Sparkles, RefreshCw, Calendar, Heart, ShieldAlert, CheckCircle } from 'lucide-react';

interface RecoveryPlannerProps {
  missedTasks: StudyTask[];
  onApplyRecoveryPlan: (rescheduledTasks: any[], motivationText: string) => void;
  subjects: string[];
}

export default function RecoveryPlanner({
  missedTasks,
  onApplyRecoveryPlan,
  subjects
}: RecoveryPlannerProps) {
  const [loading, setLoading] = useState(false);
  const [motivationLetter, setMotivationLetter] = useState<string>('');
  const [suggestedRecovery, setSuggestedRecovery] = useState<any[]>([]);
  const [completedPlan, setCompletedPlan] = useState(false);

  const handleGenerateRecovery = async () => {
    if (missedTasks.length === 0) return;
    setLoading(true);
    setCompletedPlan(false);

    try {
      const response = await fetch('/api/generate-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missedDaysCount: 1, // Assume 1-2 missed days for recovery spread
          missedTasks: missedTasks.map(t => ({ title: t.title, description: t.description, duration: t.duration, subject: t.subject })),
          subjects
        })
      });

      if (!response.ok) throw new Error('Recovery generator error');
      const data = await response.json();

      setMotivationLetter(data.motivationLetter || 'Missing a session happens to the best of us! Take a deep breath. We redistributed your tasks gently over the next 3 days.');
      setSuggestedRecovery(data.rescheduledTasks || []);
    } catch (err) {
      console.error(err);
      // Fallback
      setMotivationLetter('Hey, no stress! Missing days is completely normal. Sickness, burnout, or interruptions happen. Let\'s partition your missed items gently across this week so we stay completely on track.');
      setSuggestedRecovery(missedTasks.map((t, idx) => ({
        title: `Recovery: ${t.title}`,
        description: t.description,
        subject: t.subject,
        duration: 25,
        xpReward: t.xpReward + 5,
        daysOffset: (idx % 3) + 1
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (suggestedRecovery.length === 0) return;
    onApplyRecoveryPlan(suggestedRecovery, motivationLetter);
    setCompletedPlan(true);
    setSuggestedRecovery([]);
  };

  return (
    <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[20px] shadow-xl backdrop-blur-md relative overflow-hidden space-y-6">
      {/* Background glow lines */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full animate-pulse"></div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
            <Heart className="w-6 h-6 animate-pulse text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5 uppercase">
              Proactive Recovery Planner
            </h3>
            <p className="text-xs text-slate-400">Non-judgmental, warm task redistribution when study routines are disrupted.</p>
          </div>
        </div>

        {missedTasks.length > 0 && !completedPlan && (
          <button
            onClick={handleGenerateRecovery}
            disabled={loading}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 active:scale-95 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-purple-600/10"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Planning catch-up...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Formulate Warm Recovery
              </>
            )}
          </button>
        )}
      </div>

      {missedTasks.length === 0 ? (
        <div className="p-4 bg-emerald-500/5 hover:bg-emerald-500/8 border border-emerald-500/20 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="text-xs font-bold text-emerald-400 block">Perfect consistency! No backlog tasks.</span>
            <p className="text-[11px] text-slate-400 mt-1">
              You do not have any past due uncompleted tasks. Your revision calendar stands completely clean! Keep up this amazing momentum.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <span className="text-xs font-bold text-slate-200">Consistency warning: {missedTasks.length} pending past due tasks</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Rather than stressing or feeling guilty about days you couldn't put in, generate a personalized plan. Re-allocating tasks over 3 days lowers academic burnout.
              </p>
            </div>
          </div>

          {/* AI generated recommendations letters */}
          {motivationLetter && (
            <div className="p-5 bg-slate-950/40 border border-white/5 rounded-xl space-y-4 animate-fade-in relative">
              <span className="absolute top-2 right-3 text-[9px] text-indigo-400 uppercase font-bold tracking-widest">AI Expert Message</span>
              <p className="text-xs text-slate-300 leading-relaxed italic pr-12">
                "{motivationLetter}"
              </p>

              {suggestedRecovery.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Rescheduled Microtasks Portfolio</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {suggestedRecovery.map((s, idx) => (
                      <div key={idx} className="p-3 bg-white/2 border border-slate-800 rounded-xl">
                        <span className="text-[9px] uppercase font-bold text-cyan-400 tracking-wide">
                          Subject: {s.subject}
                        </span>
                        <h5 className="text-xs font-bold text-slate-200 truncate mt-1">{s.title}</h5>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{s.description}</p>
                        <span className="text-[9px] text-purple-400 font-bold block mt-2 text-right">
                          Due: {s.daysOffset} {s.daysOffset === 1 ? 'day' : 'days'} from today
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleApply}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-lg"
                    >
                      Apply Adjusted Study Plan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {completedPlan && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs text-center animate-fade-in">
          🎉 Recovery plan successfully scheduled! Check your calendar view to see rescheduled study blocks.
        </div>
      )}
    </div>
  );
}
