import logger from '../config/logger';
import AppError from '../utils/AppError';
import { handleServiceError } from '../utils/handleServiceError';
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

const findOwned = (id: number, userId: number): Promise<Note> =>
  noteRepository.findOne(id, userId).then((note) => {
    if (!note) {
      throw new AppError('Note not found', 404);
    }
    return note;
  });

const list = async (userId: number, filters: NoteFilters): Promise<NoteDto[]> => {
  try {
    const notes = await noteRepository.findAllByUser(userId, filters);
    return notes.map(toDto);
  } catch (error) {
    return handleServiceError(error, 'notes.list');
  }
};

const get = async (id: number, userId: number): Promise<NoteDto> => {
  try {
    return toDto(await findOwned(id, userId));
  } catch (error) {
    return handleServiceError(error, 'notes.get');
  }
};

const create = async (userId: number, data: NoteData): Promise<NoteDto> => {
  try {
    const note = await noteRepository.create(userId, clean(data));
    logger.info({ userId, noteId: note.id }, 'Note created');
    return toDto(note);
  } catch (error) {
    return handleServiceError(error, 'notes.create');
  }
};

const update = async (id: number, userId: number, data: Partial<NoteData>): Promise<NoteDto> => {
  try {
    const note = await findOwned(id, userId);
    const updated = await noteRepository.update(note, clean(data));
    logger.info({ userId, noteId: id }, 'Note updated');
    return toDto(updated);
  } catch (error) {
    return handleServiceError(error, 'notes.update');
  }
};

const remove = async (id: number, userId: number): Promise<void> => {
  try {
    const note = await findOwned(id, userId);
    await noteRepository.remove(note);
    logger.info({ userId, noteId: id }, 'Note deleted');
  } catch (error) {
    return handleServiceError(error, 'notes.remove');
  }
};

const exportAll = async (userId: number): Promise<ExportedNote[]> => {
  try {
    const notes = await noteRepository.findAllByUser(userId);
    return notes.map(({ title, content, color, isPinned }) => ({ title, content, color, isPinned }));
  } catch (error) {
    return handleServiceError(error, 'notes.export');
  }
};

const importMany = async (userId: number, items: NoteData[]): Promise<number> => {
  try {
    const created = await noteRepository.bulkCreate(userId, items.map((item) => clean(item)));
    logger.info({ userId, count: created.length }, 'Notes imported');
    return created.length;
  } catch (error) {
    return handleServiceError(error, 'notes.import');
  }
};

const noteService = { list, get, create, update, remove, exportAll, importMany };

export default noteService;
