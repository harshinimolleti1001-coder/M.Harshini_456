export interface StudentProfile {
  semester: string;
  subjects: string[];
  examDate: string;
  dailyFreeTime: number; // in hours
  attendancePercentage: number;
  procrastinationType?: string;
  procrastinationAnalysis?: string;
  focusTips?: string[];
}

export type TaskType = 'session' | 'deadline' | 'revision' | 'mock_test';

export interface StudyTask {
  id: string;
  title: string;
  description: string;
  subject: string;
  duration: number; // in minutes (e.g., 25 for standard Pomodoro)
  date: string; // ISO format: YYYY-MM-DD
  completed: boolean;
  completedAt?: string; // ISO Datetime
  missed?: boolean;
  isRecovery?: boolean; // True if automatically rescheduled due to a missed day
  type: TaskType;
  xpReward: number;
  urgent?: boolean;
  important?: boolean;
}

export interface NotesItem {
  id: string;
  title: string;
  content: string;
  subject: string;
  pinned: boolean;
  updatedAt: string;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  lastActiveDate?: string; // YYYY-MM-DD
  streakFreezes?: number; // Number of purchased streak freezes available
}

export interface CountdownEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: 'GATE' | 'Semester' | 'Contest' | 'Placement';
}
