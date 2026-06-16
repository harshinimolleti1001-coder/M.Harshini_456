import React, { useState } from 'react';
import { 
  X, 
  Award, 
  Flame, 
  Star, 
  Trophy, 
  Sparkles, 
  Lock, 
  Check, 
  HelpCircle,
  Gem,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { GamificationState } from '../types';

interface BadgesGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GamificationState;
}

interface BadgeDetails {
  id: string;
  key: string; // matches what is in stats.badges array (e.g., 'Beginner', 'Consistent learner', 'Top learner')
  name: string;
  description: string;
  howToEarn: string;
  rewardText: string;
  tips: string;
  currentProgressDesc: (stats: GamificationState) => string;
  progressPercent: (stats: GamificationState) => number;
  iconType: 'beginner' | 'consistent' | 'top';
}

export default function BadgesGalleryModal({
  isOpen,
  onClose,
  stats
}: BadgesGalleryModalProps) {
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);

  if (!isOpen) return null;

  // The collection of available badges
  const badgesData: BadgeDetails[] = [
    {
      id: 'badge-1',
      key: 'Beginner',
      name: 'Beginner Archetype',
      description: 'Awarded immediately upon finalising your parent-coached study profile onboarding setup.',
      howToEarn: 'Complete the initial onboarding form, configure your subject streams, and input your exam countdown.',
      rewardText: '🎁 +50 XP Starting Bonus on initialization',
      tips: 'You unlocked this during setup! This set your initial academic consistency index parameters.',
      currentProgressDesc: (s) => s.badges.includes('Beginner') ? '100% completed' : '0/1 Onboarding Complete',
      progressPercent: (s) => s.badges.includes('Beginner') ? 100 : 0,
      iconType: 'beginner'
    },
    {
      id: 'badge-2',
      key: 'Consistent learner',
      name: 'Consistent Learner',
      description: 'Presented to students maintaining an active, uninterrupted daily study streak of three or more days.',
      howToEarn: 'Maintain an active daily study streak of ≥ 3 days. Use Streak Freezes to safeguard your streak from resets.',
      rewardText: '🔥 Multiplier Active! +10% XP bonus on all finished revision tasks',
      tips: 'Complete at least one revision task or mock study session. If you are going to miss a day, purchase a Streak Freeze shield (50 XP) in the dashboard immediately to defend your hard-earned progress!',
      currentProgressDesc: (s) => s.badges.includes('Consistent learner') 
        ? `Unlocked! Current streak: ${s.streak} days` 
        : `Progress: ${s.streak} / 3 consecutive days`,
      progressPercent: (s) => s.badges.includes('Consistent learner') ? 100 : Math.min(100, Math.round((s.streak / 3) * 100)),
      iconType: 'consistent'
    },
    {
      id: 'badge-3',
      key: 'Top learner',
      name: 'Top Learner',
      description: 'The highest academic badge earned by accumulating 400 or more total XP.',
      howToEarn: 'Reach a Cumulative consistency XP index of 400 or more by validating completed study sprints.',
      rewardText: '🎨 Exclusive "Golden Halo" styling & advanced Parent AI tutor prestige',
      tips: 'Accumulate XP by launching Pomodoro timers and checklisting revision tasks. Consistent daily streaks grant XP multipliers that make hitting this milestone much faster!',
      currentProgressDesc: (s) => s.badges.includes('Top learner') 
        ? `Unlocked! Current XP: ${s.xp}` 
        : `Progress: ${s.xp} / 400 XP`,
      progressPercent: (s) => s.badges.includes('Top learner') ? 100 : Math.min(100, Math.round((s.xp / 400) * 100)),
      iconType: 'top'
    }
  ];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const currentSelectedBadge = selectedBadgeId 
    ? badgesData.find(b => b.id === selectedBadgeId) 
    : badgesData[0];

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in cursor-default overflow-y-auto"
    >
      <div 
        id="badges-gallery-modal-container"
        className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[28px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-scale-up"
      >
        {/* Left Section: Badges Grid */}
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto border-b md:border-b-0 md:border-r border-white/10">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">Student Accomplishments</span>
                <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
                  <Award className="w-6 h-6 text-indigo-400" />
                  <span>Badges Gallery</span>
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-200 transition md:hidden cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Banner */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-300">
                  <Gem className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">CURRENT INDEX STATUS</span>
                  <span className="text-sm font-bold text-slate-200">Level {stats.level} ({stats.xp} Total XP)</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">ACTIVE STUDY STREAK</span>
                  <span className="text-sm font-bold text-slate-200">{stats.streak} Days</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  ❄️
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium block">STREAK SHIELDS</span>
                  <span className="text-sm font-bold text-slate-200">{stats.streakFreezes || 0} Freezes</span>
                </div>
              </div>
            </div>

            {/* Grid list of Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {badgesData.map((badge) => {
                const isUnlocked = stats.badges.includes(badge.key);
                const progressVal = badge.progressPercent(stats);
                const isSelected = selectedBadgeId === badge.id || (!selectedBadgeId && badge.id === 'badge-1');

                return (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadgeId(badge.id)}
                    className={`relative p-5 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-600/15 border-indigo-500/40 shadow-lg shadow-indigo-500/5 scale-[1.02]' 
                        : isUnlocked 
                          ? 'bg-white/5 border-white/10 hover:bg-white/8 hover:scale-[1.01]' 
                          : 'bg-white/[0.02] border-white/5 opacity-60 hover:opacity-80 hover:bg-white/5 hover:scale-[1.01]'
                    }`}
                  >
                    {/* Badge Icon Layout */}
                    <div className="relative mb-3">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        isUnlocked 
                          ? badge.iconType === 'beginner' 
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-400/20' 
                            : badge.iconType === 'consistent'
                              ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20'
                              : 'bg-pink-500/20 text-pink-400 border border-pink-400/20 animate-pulse'
                          : 'bg-slate-800 text-slate-500 border border-white/5'
                      }`}>
                        {badge.iconType === 'beginner' && <Star className="w-7 h-7" />}
                        {badge.iconType === 'consistent' && <Flame className="w-7 h-7" />}
                        {badge.iconType === 'top' && <Trophy className="w-7 h-7" />}
                      </div>

                      {/* Overly locked padlock icon / unlock checkmark */}
                      {isUnlocked ? (
                        <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-slate-900" title="Unlocked">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="absolute -bottom-1 -right-1 bg-slate-800 text-slate-400 rounded-full p-1 border border-white/10" title="Locked">
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {/* Badge Name */}
                    <h4 className={`text-xs font-bold ${isUnlocked ? 'text-slate-100' : 'text-slate-400'} line-clamp-1`}>
                      {badge.name}
                    </h4>

                    {/* Progress details */}
                    <div className="w-full mt-3.5 space-y-1">
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-medium">
                        <span>{isUnlocked ? 'Unlocked' : 'Locked'}</span>
                        <span className="font-mono">{progressVal}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            isUnlocked 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                              : 'bg-indigo-600/60'
                          }`}
                          style={{ width: `${progressVal}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5">
            <h5 className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase mb-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              <span>How Student Gamification Works</span>
            </h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Earn XP by checklisting items, launching 25-minute Pomodoro timers, and remaining logged in. 
              Streaks multiply XP gains but are easily lost. Defend them at all cost using consistency 
              <strong> Streak Freezes (50 XP each)</strong> or plan recovery routines with the AI Planner.
            </p>
          </div>
        </div>

        {/* Right Section: Badge Detailed Inspector Drawer */}
        <div className="w-full md:w-[320px] p-6 md:p-8 bg-slate-950/50 flex flex-col justify-between overflow-y-auto">
          {currentSelectedBadge ? (
            <div className="h-full flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    Badge Inspector
                  </span>
                  <button 
                    onClick={onClose}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-200 transition hidden md:block cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center gap-3.5 border-b border-white/5 pb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    stats.badges.includes(currentSelectedBadge.key)
                      ? currentSelectedBadge.iconType === 'beginner' 
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-400/20' 
                        : currentSelectedBadge.iconType === 'consistent'
                          ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20'
                          : 'bg-pink-500/20 text-pink-400 border border-pink-400/20'
                      : 'bg-slate-800 text-slate-500 border border-white/5'
                  }`}>
                    {currentSelectedBadge.iconType === 'beginner' && <Star className="w-7 h-7" />}
                    {currentSelectedBadge.iconType === 'consistent' && <Flame className="w-7 h-7" />}
                    {currentSelectedBadge.iconType === 'top' && <Trophy className="w-7 h-7" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm leading-tight">{currentSelectedBadge.name}</h3>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {currentSelectedBadge.currentProgressDesc(stats)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Impact Description</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{currentSelectedBadge.description}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Requirement</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed bg-white/[0.02] border border-white/5 rounded-xl p-3">
                      {currentSelectedBadge.howToEarn}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Bonus Reward Unlock</span>
                    <p className="text-[11px] text-cyan-300 font-bold leading-relaxed bg-cyan-950/10 border border-cyan-500/10 rounded-xl p-2.5 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{currentSelectedBadge.rewardText}</span>
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Academic Advisory Tip</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                      "{currentSelectedBadge.tips}"
                    </p>
                  </div>
                </div>
              </div>

              {stats.badges.includes(currentSelectedBadge.key) ? (
                <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <span className="bg-emerald-500/15 border border-emerald-500/25 p-1 rounded-lg">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                  <span>Officially Conquered! Keep it up.</span>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-indigo-300 text-xs font-semibold animate-pulse">
                  <span className="bg-indigo-500/15 border border-indigo-500/25 p-1 rounded-lg">
                    <Lock className="w-4 h-4" />
                  </span>
                  <span>Unearned. Follow the tips to unlock!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-xs text-slate-500 italic p-6">
              Select a badge from the gallery to explore detailed requirements, status, and tutor tips!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
