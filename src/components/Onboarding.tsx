import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { Sparkles, Calendar, BookOpen, Clock, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: StudentProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [semester, setSemester] = useState('4th Semester');
  const [subjectsText, setSubjectsText] = useState('Operating Systems, DBMS, Algorithms');
  const [examDate, setExamDate] = useState('2026-07-20');
  const [dailyFreeTime, setDailyFreeTime] = useState(3);
  const [attendance, setAttendance] = useState(74); // Starting near 75% as noted in prompt
  const [surveyAnswers, setSurveyAnswers] = useState('Tends to postone hard programming tasks until the final 12 hours.');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const subjects = subjectsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (subjects.length === 0) {
      setErrorMsg('Please input at least one subject.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/analyze-procrastination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semester,
          subjects,
          examDate,
          dailyFreeTime,
          attendancePercentage: attendance,
          survey: surveyAnswers
        })
      });

      if (!response.ok) throw new Error('Failed to fetch procrastination insights.');
      
      const analysis = await response.json();
      
      onComplete({
        semester,
        subjects,
        examDate,
        dailyFreeTime,
        attendancePercentage: attendance,
        procrastinationType: analysis.procrastinationType || 'The Crisis Maker',
        procrastinationAnalysis: analysis.analysis || 'You thrive under intense pressure, but your attendence is at a key threshold.',
        focusTips: analysis.focusTips || [
          'Commit to single 25-minute Pomodoro blocks.',
          'Review attendance weekly to secure exam permission.',
          'Start with low-friction review before tackling heavy coding.'
        ]
      });
    } catch (err: any) {
      console.error(err);
      // Fallback
      onComplete({
        semester,
        subjects,
        examDate,
        dailyFreeTime,
        attendancePercentage: attendance,
        procrastinationType: 'The Crisis Maker',
        procrastinationAnalysis: 'You tend to wait until pressure is maximum. With attendance close to the 75% threshold, you face additional subtle stress. Let\'s conquer this step by step.',
        focusTips: [
          'Start standard 25-minute study sessions for quick wins.',
          'Aim to improve your attendance above 75% immediately to prevent exam blocks.',
          'Divide large topics into 3 sub-tasks right now.'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 md:px-8 py-10">
      <div id="onboarding-card" className="w-full max-w-2xl bg-white/5 border border-white/10 dark:bg-slate-900/40 p-8 md:p-12 rounded-[20px] shadow-2xl backdrop-blur-xl animate-fade-in relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full"></div>

        <div className="text-center mb-8 relative">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-sans tracking-tight font-bold bg-gradient-to-r from-indigo-200 via-white to-cyan-200 bg-clip-text text-transparent">
            Anti-Procrastination Expert
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">
            Custom academic scheduling, Gamified Streaks, and AI study recovery plans.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs text-center">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Semester Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                <Award className="w-4.5 h-4.5 text-indigo-400" /> Current Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full p-3 bg-white/5 hover:bg-white/15 dark:hover:bg-white/5 dark:bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200 text-sm"
              >
                <option value="1st Semester">1st Semester (Freshman)</option>
                <option value="2nd Semester">2nd Semester (Freshman)</option>
                <option value="3rd Semester">3rd Semester (Sophomore)</option>
                <option value="4th Semester">4th Semester (Sophomore)</option>
                <option value="5th Semester">5th Semester (Junior)</option>
                <option value="6th Semester">6th Semester (Junior)</option>
                <option value="7th Semester">7th Semester (Senior)</option>
                <option value="8th Semester">8th Semester (Senior)</option>
              </select>
            </div>

            {/* Exam Date */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                <Calendar className="w-4.5 h-4.5 text-indigo-400" /> Main Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full p-3 bg-white/5 hover:bg-white/15 dark:hover:bg-white/5 dark:bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200 text-sm"
                required
              />
            </div>
          </div>

          {/* Subjects input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
              <BookOpen className="w-4.5 h-4.5 text-indigo-400" /> Active Core Subjects
            </label>
            <input
              type="text"
              placeholder="e.g. DBMS, Data Structures, Theory of Computation"
              value={subjectsText}
              onChange={(e) => setSubjectsText(e.target.value)}
              className="w-full p-3 bg-white/5 hover:bg-white/15 dark:hover:bg-white/5 dark:bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200 text-sm placeholder-slate-500"
              required
            />
            <p className="text-[11px] text-slate-500">Separate subjects with commas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Free Time */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                <Clock className="w-4.5 h-4.5 text-indigo-400" /> Daily Free study time
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={dailyFreeTime}
                  onChange={(e) => setDailyFreeTime(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-white/10 rounded-lg appearance-none h-1.5"
                />
                <span className="text-sm font-semibold text-cyan-400 min-w-12 text-right">
                  {dailyFreeTime} hrs
                </span>
              </div>
            </div>

            {/* Attendance Percentage */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-4.5 h-4.5 text-amber-400 animate-pulse" /> Attendance Percentage (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={attendance}
                  onChange={(e) => setAttendance(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-white/10 rounded-lg appearance-none h-1.5"
                />
                <span className={`text-sm font-semibold min-w-12 text-right ${attendance < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {attendance}%
                </span>
              </div>
              <p className="text-[10px] text-slate-500 italic">
                {attendance < 75 ? '⚠️ Warning: Attendance is currently below regulatory 75%' : '✅ Safe: Meeting 75% attendance criteria'}
              </p>
            </div>
          </div>

          {/* Survey questions on procrastination */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
              How do you typically study or delay work?
            </label>
            <textarea
              placeholder="e.g. I wait till the night before because I stress about coding errors, or I scroll social media when slides feel dry..."
              value={surveyAnswers}
              onChange={(e) => setSurveyAnswers(e.target.value)}
              className="w-full p-3 bg-white/5 hover:bg-white/15 dark:hover:bg-white/5 dark:bg-slate-950 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-200 text-sm h-20 placeholder-slate-600 resize-none"
            />
          </div>

          {/* Gradient Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full relative group py-3 px-6 rounded-xl overflow-hidden font-semibold text-white shadow-xl transition-all duration-300 text-sm disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 transition-all duration-300 group-hover:opacity-90"></div>
            <div className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing Your Profile with AI...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  Analyze Profile & Open Dashboard
                </>
              )}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
