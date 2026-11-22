import { NextFunction, Request, Response } from 'express';
import { AuthRequest, getUserId } from '../middlewares/authenticate';
import AppError from '../utils/AppError';
import noteService from '../services/noteService';
import type { NoteData } from '../repositories/noteRepository';

const parseId = (req: Request): number => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid note id', 400);
  }
  return id;
};

const queryString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value.trim().slice(0, 100) : undefined;

export const listNotes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notes = await noteService.list(getUserId(req), {
      search: queryString(req.query.search),
      pinned: req.query.pinned === 'true',
    });
    res.json({ success: true, data: { notes, count: notes.length } });
  } catch (error) {
    next(error);
  }
};

export const getNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const note = await noteService.get(parseId(req), getUserId(req));
    res.json({ success: true, data: { note } });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req: AuthRequest<NoteData>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const note = await noteService.create(getUserId(req), req.body);
    res.status(201).json({ success: true, message: 'Note created', data: { note } });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (
  req: AuthRequest<Partial<NoteData>>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const note = await noteService.update(parseId(req), getUserId(req), req.body);
    res.json({ success: true, message: 'Note updated', data: { note } });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await noteService.remove(parseId(req), getUserId(req));
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};

export const exportNotes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notes = await noteService.exportAll(getUserId(req));
    res.json({ success: true, data: { notes } });
  } catch (error) {
    next(error);
  }
};

export const importNotes = async (
  req: AuthRequest<{ notes: NoteData[] }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const imported = await noteService.importMany(getUserId(req), req.body.notes);
    res.status(201).json({ success: true, message: `${imported} notes imported`, data: { imported } });
  } catch (error) {
    next(error);
  }
};
