import logger from '../config/logger';
import AppError from '../utils/AppError';
import { sanitizeContent, sanitizeTitle } from '../utils/sanitize';
import noteRepository, { NoteData, NoteFilters } from '../repositories/noteRepository';
import Note, { NoteColor } from '../models/Note';

export interface NoteDto {
  id: number;
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportedNote {
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
}

const toDto = (note: Note): NoteDto => ({
  id: note.id,
  title: note.title,
  content: note.content,
  color: note.color,
  isPinned: note.isPinned,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
});

const clean = <T extends Partial<NoteData>>(data: T): T => ({
  ...data,
  ...(data.title !== undefined ? { title: sanitizeTitle(data.title) || 'Untitled' } : {}),
  ...(data.content !== undefined ? { content: sanitizeContent(data.content) } : {}),
});

const findOwned = async (id: number, userId: number): Promise<Note> => {
  const note = await noteRepository.findOne(id, userId);
  if (!note) {
    throw new AppError('Note not found', 404);
  }
  return note;
};

const list = async (userId: number, filters: NoteFilters): Promise<NoteDto[]> => {
  const notes = await noteRepository.findAllByUser(userId, filters);
  return notes.map(toDto);
};

const get = async (id: number, userId: number): Promise<NoteDto> => toDto(await findOwned(id, userId));

const create = async (userId: number, data: NoteData): Promise<NoteDto> => {
  const note = await noteRepository.create(userId, clean(data));
  logger.info({ userId, noteId: note.id }, 'Note created');
  return toDto(note);
};

const update = async (id: number, userId: number, data: Partial<NoteData>): Promise<NoteDto> => {
  const note = await findOwned(id, userId);
  const updated = await noteRepository.update(note, clean(data));
  logger.info({ userId, noteId: id }, 'Note updated');
  return toDto(updated);
};

const remove = async (id: number, userId: number): Promise<void> => {
  const note = await findOwned(id, userId);
  await noteRepository.remove(note);
  logger.info({ userId, noteId: id }, 'Note deleted');
};

const exportAll = async (userId: number): Promise<ExportedNote[]> => {
  const notes = await noteRepository.findAllByUser(userId);
  return notes.map(({ title, content, color, isPinned }) => ({ title, content, color, isPinned }));
};

const importMany = async (userId: number, items: NoteData[]): Promise<number> => {
  const created = await noteRepository.bulkCreate(userId, items.map((item) => clean(item)));
  logger.info({ userId, count: created.length }, 'Notes imported');
  return created.length;
};

const noteService = { list, get, create, update, remove, exportAll, importMany };

export default noteService;
