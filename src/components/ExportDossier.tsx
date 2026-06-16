import React, { useState } from 'react';
import { StudentProfile, StudyTask, GamificationState, NotesItem } from '../types';
import { 
  Download, 
  FileText, 
  Printer, 
  Share2, 
  CheckCircle, 
  Award, 
  BookOpen, 
  Calendar, 
  X,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface ExportDossierProps {
  profile: StudentProfile;
  tasks: StudyTask[];
  gamification: GamificationState;
  notes: NotesItem[];
}

export default function ExportDossier({ profile, tasks, gamification, notes }: ExportDossierProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // 1. Generate Plaintext format
  const generatePlaintext = () => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const completedTasks = tasks.filter(t => t.completed);
    const pendingTasks = tasks.filter(t => !t.completed);

    let text = `========================================================================
            ANTI-PROCRASTINATION COMPANION: STUDY DOSSIER
========================================================================
Generated on: ${today}
------------------------------------------------------------------------

1. STUDENT ACADEMIC PROFILE
------------------------------------------------------------------------
Semester Goal: ${profile.semester}
Focus Subjects: ${profile.subjects.join(', ')}
Attendance Track: ${profile.attendancePercentage}%
Procrastination Archetype: ${profile.procrastinationType || 'Not Assessed Yet'}
Recommended Focus Track: ${profile.focusTips?.join(', ') || 'Standard pomodoro workflows'}

2. GAMIFICATION INDEX & CONSISTENCY METRICS
------------------------------------------------------------------------
Current Level: Level ${gamification.level} (${gamification.xp} XP total)
Study Streak History: ${gamification.streak} Days active streak (Streak Freezes: ${gamification.streakFreezes || 0})
Secured Badges: ${gamification.badges.join(', ')}

3. REVISION TASKS MANAGEMENT LIST
------------------------------------------------------------------------
Completed Tasks (${completedTasks.length}):
${completedTasks.map((t, idx) => `  [x] ${t.title} (${t.subject}) - Completed in ${t.duration}m | XP Earned: +${t.xpReward}`).join('\n') || '  No completed tasks.'}

Pending Tasks List (${pendingTasks.length}):
${pendingTasks.map((t, idx) => `  [ ] ${t.title} (${t.subject}) - Scheduled for ${t.date} | ${t.duration}m | Reward: ${t.xpReward} XP`).join('\n') || '  No pending revision sessions scheduled.'}

4. ACCUMULATED CHEAT NOTES & FORMULAS SHEET
------------------------------------------------------------------------
${notes.map((note) => `Title: ${note.title} (${note.subject})
Last Updated: ${note.updatedAt}
-----------------------------------------------------------
${note.content}
===========================================================`).join('\n\n') || 'No cheat notes saved in portfolio.'}

========================================================================
  "Focus is a muscle, and consistency is the key to mastering it."
========================================================================
`;
    return text;
  };

  // 2. Generate Markdown format
  const generateMarkdown = () => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const completedTasks = tasks.filter(t => t.completed);
    const pendingTasks = tasks.filter(t => !t.completed);

    let md = `# Anti-Procrastination Companion: Study Dossier & Revision Report

*Generated on: ${today}*

---

## 👤 Student Profile & Action Plans

* **Target Goal/Semester**: ${profile.semester}
* **Core Focus Subjects**: ${profile.subjects.map(s => `\`${s}\``).join(', ')}
* **Personal Attendance Index**: ${profile.attendancePercentage}%
* **Procrastination Analysis Pattern**: ${profile.procrastinationType || '*Not Assessed*'}
* **AI Custom Focus Tips**:
${profile.focusTips?.map(tip => `  - ${tip}`).join('\n') || '  - No tips generated yet.'}

---

## 🏆 Consistency & Gamification Indices

* **Level Status**: \`Level ${gamification.level}\` (${gamification.xp} Total XP)
* **Current Active Streak**: 🔥 **${gamification.streak} Days** (Streak Freezes: ❄️ **${gamification.streakFreezes || 0}**)
* **Incentive Badges Earned**: ${gamification.badges.map(b => `🏆 **${b}**`).join(', ')}

---

## 📅 Revision Calendar & Tasks Portfolio

### Completed Active-Recall Sessions (${completedTasks.length})
${completedTasks.map((t) => `- [x] **${t.title}** (\`${t.subject}\`) • *Duration:* ${t.duration} mins • *XP Secured:* \`+${t.xpReward} XP\``).join('\n') || '*No complete tasks.*'}

### Scheduled Backlogs & Upcoming Tasks (${pendingTasks.length})
${pendingTasks.map((t) => `- [ ] **${t.title}** (\`${t.subject}\`) • *Due Date:* ${t.date} • *Duration:* ${t.duration} mins • *Potential reward:* \`+${t.xpReward} XP\``).join('\n') || '*No pending tasks left.*'}

---

## 📝 Integrated Cheat Notes & Formula Cards

${notes.map((note) => `### 📓 ${note.title} [\`${note.subject}\`]
*Last Updated: ${note.updatedAt}*

\`\`\`text
${note.content}
\`\`\`
`).join('\n\n---\n\n') || '*No cheat sheets tracked in workspace yet.*'}

---

> "Small consistent sprints beat massive delayed marathons absolute times. Protect your streak!"
`;
    return md;
  };

  // Action helpers to download
  const handleDownloadTxt = () => {
    const textBlob = new Blob([generatePlaintext()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(textBlob);
    const element = document.createElement('a');
    element.href = url;
    element.download = `study-companion-dossier-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMd = () => {
    const textBlob = new Blob([generateMarkdown()], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(textBlob);
    const element = document.createElement('a');
    element.href = url;
    element.download = `academic-focus-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    setShowPrintPreview(true);
    // Let state draw print preview DOM, then trigger native print screen
    setTimeout(() => {
      window.print();
      setShowPrintPreview(false);
    }, 450);
  };

  return (
    <>
      {/* 1. BUTTON TO EXPAND MENU (Desktop & Mobile) */}
      <div className="relative inline-block text-left print:hidden">
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4.5 py-2.5 bg-gradient-to-tr from-cyan-600/10 to-indigo-600/10 hover:from-cyan-600/20 hover:to-indigo-600/20 border border-cyan-500/20 rounded-xl text-xs font-bold text-cyan-300 uppercase tracking-wider transition shadow-lg shadow-cyan-900/5 cursor-pointer max-w-full"
            id="export-dossier-menu-button"
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>Export Portfolio</span>
            <ChevronDown className={`w-3.5 h-3.5 transition duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
          </button>
        </div>

        {isOpen && (
          <>
            {/* Backdrop click barrier to lock down dropdown */}
            <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)} />
            
            <div 
              className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-slate-950/95 border border-white/10 shadow-2xl backdrop-blur-xl z-50 p-2 animate-fade-in text-slate-200"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="export-dossier-menu-button"
            >
              <div className="px-3 py-2 border-b border-white/5 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Report Generator
                </span>
                <p className="text-[11px] text-slate-500">Secure your notes, streaks & schedule offsets offline.</p>
              </div>

              <div className="p-1 space-y-1">
                <button
                  onClick={() => {
                    handleDownloadTxt();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2.5 rounded-xl hover:bg-white/5 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
                  role="menuitem"
                >
                  <FileText className="w-4.5 h-4.5 text-indigo-400" />
                  <span>Download Plaintext (.txt)</span>
                </button>

                <button
                  onClick={() => {
                    handleDownloadMd();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2.5 rounded-xl hover:bg-white/5 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
                  role="menuitem"
                >
                  <BookOpen className="w-4.5 h-4.5 text-cyan-400" />
                  <span>Download Markdown (.md)</span>
                </button>

                <button
                  onClick={() => {
                    handlePrint();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2.5 rounded-xl hover:bg-white/5 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
                  role="menuitem"
                >
                  <Printer className="w-4.5 h-4.5 text-pink-400" />
                  <span>Print Portfolio / Save PDF</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 2. PRINT-READY HIDDEN VIEW / PREVIEW DOM SHEET */}
      {/* This DOM block is only exposed or targeted via standard print styles. We force it to render beautifully when window.print is called */}
      <div className={`hidden print:block fixed inset-0 bg-white text-slate-900 z-[999999] overflow-auto p-12 space-y-8 font-sans`}>
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Anti-Procrastination Study Report</h1>
            <p className="text-xs text-slate-500 font-mono mt-1">Academic Portfolio & Streak Dossier</p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <span>Date: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Profile details */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold border-b border-slate-300 pb-1 text-indigo-800 uppercase tracking-wide">1. Core Academic Profile</h2>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-700">
            <div><strong>Active Goal:</strong> {profile.semester}</div>
            <div><strong>Attendance Track:</strong> {profile.attendancePercentage}%</div>
            <div><strong>Procrastination Class:</strong> {profile.procrastinationType || "Unassessed"}</div>
            <div><strong>Focus Subjects:</strong> {profile.subjects.join(', ')}</div>
          </div>
        </section>

        {/* Milestone metrics */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold border-b border-slate-300 pb-1 text-indigo-800 uppercase tracking-wide">2. Study Streak Metrics</h2>
          <div className="grid grid-cols-3 gap-4 text-sm text-slate-700">
            <div className="p-3 bg-slate-100 rounded-lg text-center">
              <span className="text-xs text-slate-500 uppercase font-bold block">Current Level</span>
              <strong className="text-xl text-slate-800 font-mono">Level {gamification.level}</strong>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg text-center">
              <span className="text-xs text-slate-500 uppercase font-bold block">Secured Practice XP</span>
              <strong className="text-xl text-slate-800 font-mono">{gamification.xp} XP</strong>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg text-center">
              <span className="text-xs text-slate-500 uppercase font-bold block">Active Streak</span>
              <strong className="text-xl text-slate-800 font-mono">{gamification.streak} Days</strong>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span><strong>Unlocked Badges:</strong> {gamification.badges.join(', ')}</span>
            <span><strong>Active Streak Freezes:</strong> ❄️ {gamification.streakFreezes || 0}</span>
          </div>
        </section>

        {/* Tasks revision blocks */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold border-b border-slate-300 pb-1 text-indigo-800 uppercase tracking-wide">3. Revision Tasks Log</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Completed Sessions</h3>
              <table className="w-full text-xs text-slate-700 mt-1 border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2">Task / Milestone</th>
                    <th className="py-2">Subject</th>
                    <th className="py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.filter(t => t.completed).map((t, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-2 font-medium">{t.title}</td>
                      <td className="py-2">{t.subject}</td>
                      <td className="py-2">{t.duration} mins</td>
                    </tr>
                  ))}
                  {tasks.filter(t => t.completed).length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-2 text-slate-400 italic text-center">No completed study sessions registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Upcoming & Scheduled Revisions</h3>
              <table className="w-full text-xs text-slate-700 mt-1 border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2">Pending Task</th>
                    <th className="py-2">Subject</th>
                    <th className="py-2">Due Date</th>
                    <th className="py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.filter(t => !t.completed).map((t, index) => (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-2 font-medium">{t.title}</td>
                      <td className="py-2">{t.subject}</td>
                      <td className="py-2 font-mono">{t.date}</td>
                      <td className="py-2">{t.duration} mins</td>
                    </tr>
                  ))}
                  {tasks.filter(t => !t.completed).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-2 text-slate-400 italic text-center">All Scheduled tasks are completed. Well done!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Cheat notes printed list */}
        <section className="space-y-4 page-break-before">
          <h2 className="text-lg font-bold border-b border-slate-300 pb-1 text-indigo-800 uppercase tracking-wide">4. Revision Cheat Notes</h2>
          
          <div className="space-y-6">
            {notes.map((note) => (
              <div key={note.id} className="p-4 border border-slate-200 rounded-lg text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-600 font-bold border-b border-slate-100 pb-1.5">
                  <span className="text-slate-800 font-bold text-sm">📓 {note.title}</span>
                  <span className="font-mono text-[10px]">({note.subject})</span>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-700 leading-relaxed bg-slate-50 p-3 rounded">
                  {note.content}
                </pre>
              </div>
            ))}
            {notes.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-4">No custom cheat note records kept in academic companion.</p>
            )}
          </div>
        </section>

        <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-8 mt-12">
          <span>Printed from Anti-Procrastination High-Performers Workspace Console.</span>
        </div>
      </div>
    </>
  );
}
