export const NOTE_COLORS = ['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteInput {
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
}

export interface AuthResult {
  user: User;
  token: string;
}
