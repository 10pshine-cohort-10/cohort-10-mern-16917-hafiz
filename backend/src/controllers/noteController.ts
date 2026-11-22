import { Request, Response } from 'express';
import { AuthRequest, getUserId } from '../middlewares/authenticate';
import AppError from '../utils/AppError';
import noteService from '../services/noteService';

const parseId = (req: Request): number => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid note id', 400);
  }
  return id;
};

const queryString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value.trim().slice(0, 100) : undefined;

export const listNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  const notes = await noteService.list(getUserId(req), {
    search: queryString(req.query.search),
    pinned: req.query.pinned === 'true',
  });
  res.json({ success: true, data: { notes, count: notes.length } });
};

export const getNote = async (req: AuthRequest, res: Response): Promise<void> => {
  const note = await noteService.get(parseId(req), getUserId(req));
  res.json({ success: true, data: { note } });
};

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  const note = await noteService.create(getUserId(req), req.body);
  res.status(201).json({ success: true, message: 'Note created', data: { note } });
};

export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  const note = await noteService.update(parseId(req), getUserId(req), req.body);
  res.json({ success: true, message: 'Note updated', data: { note } });
};

export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  await noteService.remove(parseId(req), getUserId(req));
  res.json({ success: true, message: 'Note deleted' });
};

export const exportNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  const notes = await noteService.exportAll(getUserId(req));
  res.json({ success: true, data: { notes } });
};

export const importNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  const imported = await noteService.importMany(getUserId(req), req.body.notes);
  res.status(201).json({ success: true, message: `${imported} notes imported`, data: { imported } });
};
