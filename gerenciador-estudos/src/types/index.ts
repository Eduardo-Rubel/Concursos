export type Priority = 'Alta' | 'Média' | 'Baixa';

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon?: string;
  weight: number;
  priority: Priority;
  status: 'Ativo' | 'Inativo';
}

export interface StudySession {
  id: string;
  subjectId: string;
  durationMinutes: number;
  date: string; // ISO string
  notes?: string;
}

export interface Settings {
  userName: string;
  dailyGoalHours: number;
  pomodoroWork: number;
  pomodoroRest: number;
  telegramBotToken?: string;
  telegramChatId?: string;
  enableTelegramAlerts?: boolean;
  lastTelegramDailyAlertDate?: string;
  geminiApiKey?: string;
}

export interface ScheduleItem {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
  subjectId: string;
}

export interface Revision {
  id: string;
  subjectId: string;
  originalSessionId: string;
  revisionDate: string;
  type: '24h' | '7d' | '30d';
  status: 'pending' | 'completed';
}

export interface QuestionLog {
  id: string;
  subjectId: string;
  topic: string;
  total: number;
  correct: number;
  date: string;
}

export interface MockExam {
  id: string;
  title: string;
  date: string;
  score: number;
  totalQuestions: number;
  timeSpentMinutes: number;
  notes?: string;
}

export interface NoteTag {
  id: string;
  name: string;
  color: string;
}

export interface NoteFolder {
  id: string;
  name: string;
  parentId?: string;
}

export interface StudyNote {
  id: string;
  sessionId?: string;
  subjectId: string;
  title: string;
  content: string;
  tags: string[];
  folderId?: string;
  
  objectives?: string;
  learnedConcepts?: string;
  errorsMade?: string;
  difficulties?: string;
  comprehensionLevel: number;
  confidenceLevel: 'Baixo' | 'Médio' | 'Alto';
  
  isFavorite: boolean;
  status: 'Em andamento' | 'Completo' | 'Revisar';
  
  createdAt: string;
  updatedAt: string;
}
