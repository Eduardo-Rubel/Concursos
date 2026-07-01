import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Subject, StudySession, Settings, ScheduleItem, 
  Revision, QuestionLog, MockExam, StudyNote, NoteTag, NoteFolder 
} from '../types';
import { addDays } from 'date-fns';

interface StudyState {
  subjects: Subject[];
  sessions: StudySession[];
  settings: Settings;
  schedules: ScheduleItem[];
  revisions: Revision[];
  questionLogs: QuestionLog[];
  mockExams: MockExam[];
  
  // Phase 3
  notes: StudyNote[];
  tags: NoteTag[];
  folders: NoteFolder[];
  
  // Actions
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  
  addSession: (session: Omit<StudySession, 'id'>) => string; // return sessionId
  
  updateSettings: (settings: Partial<Settings>) => void;
  addSchedule: (schedule: Omit<ScheduleItem, 'id'>) => void;
  deleteSchedule: (id: string) => void;
  completeRevision: (id: string) => void;
  addQuestionLog: (log: Omit<QuestionLog, 'id'>) => void;
  addMockExam: (exam: Omit<MockExam, 'id'>) => void;

  // Note Actions
  addNote: (note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateNote: (id: string, updates: Partial<StudyNote>) => void;
  deleteNote: (id: string) => void;
  addTag: (tag: Omit<NoteTag, 'id'>) => void;
  addFolder: (folder: Omit<NoteFolder, 'id'>) => void;
  scheduleRevisionsForNote: (noteId: string, subjectId: string) => void;
}

const defaultSettings: Settings = {
  userName: 'Eduardo',
  dailyGoalHours: 4,
  pomodoroWork: 50,
  pomodoroRest: 10,
  telegramBotToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
  telegramChatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || '',
  enableTelegramAlerts: !!import.meta.env.VITE_TELEGRAM_BOT_TOKEN,
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || ''
};

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      subjects: [],
      sessions: [],
      settings: defaultSettings,
      schedules: [],
      revisions: [],
      questionLogs: [],
      mockExams: [],
      notes: [],
      tags: [],
      folders: [],

      addSubject: (subject) => set((state) => ({
        subjects: [...state.subjects, { ...subject, id: crypto.randomUUID() }]
      })),
      
      updateSubject: (id, updatedFields) => set((state) => ({
        subjects: state.subjects.map(sub => sub.id === id ? { ...sub, ...updatedFields } : sub)
      })),
      
      deleteSubject: (id) => set((state) => ({
        subjects: state.subjects.filter(sub => sub.id !== id)
      })),

      addSession: (session) => {
        const sessionId = crypto.randomUUID();
        set((state) => ({
          sessions: [...state.sessions, { ...session, id: sessionId }]
        }));
        return sessionId;
      },

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      addSchedule: (schedule) => set((state) => ({
        schedules: [...state.schedules, { ...schedule, id: crypto.randomUUID() }]
      })),

      deleteSchedule: (id) => set((state) => ({
        schedules: state.schedules.filter(sch => sch.id !== id)
      })),

      completeRevision: (id) => set((state) => ({
        revisions: state.revisions.map(rev => rev.id === id ? { ...rev, status: 'completed' } : rev)
      })),

      addQuestionLog: (log) => set((state) => ({
        questionLogs: [...state.questionLogs, { ...log, id: crypto.randomUUID() }]
      })),

      addMockExam: (exam) => set((state) => ({
        mockExams: [...state.mockExams, { ...exam, id: crypto.randomUUID() }]
      })),

      // Notes
      addNote: (note) => {
        const id = crypto.randomUUID();
        set((state) => ({
          notes: [...state.notes, {
            ...note,
            id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }]
        }));
        return id;
      },

      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)
      })),

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(n => n.id !== id)
      })),

      addTag: (tag) => set((state) => ({
        tags: [...state.tags, { ...tag, id: crypto.randomUUID() }]
      })),

      addFolder: (folder) => set((state) => ({
        folders: [...state.folders, { ...folder, id: crypto.randomUUID() }]
      })),

      // Revisions are now tied to notes (Phase 3 logic)
      scheduleRevisionsForNote: (noteId, subjectId) => set((state) => {
        const dateObj = new Date();
        const newRevisions: Revision[] = [
          {
            id: crypto.randomUUID(),
            subjectId,
            originalSessionId: noteId, // using noteId instead of sessionId for Phase 3
            revisionDate: addDays(dateObj, 1).toISOString(),
            type: '24h',
            status: 'pending'
          },
          {
            id: crypto.randomUUID(),
            subjectId,
            originalSessionId: noteId,
            revisionDate: addDays(dateObj, 7).toISOString(),
            type: '7d',
            status: 'pending'
          },
          {
            id: crypto.randomUUID(),
            subjectId,
            originalSessionId: noteId,
            revisionDate: addDays(dateObj, 30).toISOString(),
            type: '30d',
            status: 'pending'
          }
        ];
        return {
          revisions: [...state.revisions, ...newRevisions]
        };
      })
    }),
    {
      name: 'study-management-storage',
      merge: (persistedState: unknown, currentState: StudyState): StudyState => {
        const persisted = persistedState as Partial<StudyState> | undefined;
        if (!persisted) return currentState;

        // Merge settings: env vars fill in empty persisted values
        const mergedSettings = {
          ...defaultSettings,
          ...(persisted.settings || {}),
        };

        // If persisted values are empty but env vars exist, use env vars
        if (!mergedSettings.telegramBotToken && defaultSettings.telegramBotToken) {
          mergedSettings.telegramBotToken = defaultSettings.telegramBotToken;
        }
        if (!mergedSettings.telegramChatId && defaultSettings.telegramChatId) {
          mergedSettings.telegramChatId = defaultSettings.telegramChatId;
        }
        if (!mergedSettings.geminiApiKey && defaultSettings.geminiApiKey) {
          mergedSettings.geminiApiKey = defaultSettings.geminiApiKey;
        }
        if (mergedSettings.telegramBotToken && !mergedSettings.enableTelegramAlerts) {
          mergedSettings.enableTelegramAlerts = true;
        }

        return {
          ...currentState,
          ...persisted,
          settings: mergedSettings,
        };
      },
    }
  )
);
