import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler';
import validate from '../middlewares/validate';
import authenticate from '../middlewares/authenticate';
import { createNoteSchema, updateNoteSchema, importNotesSchema } from '../validators/noteValidators';
import {
  listNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  exportNotes,
  importNotes,
} from '../controllers/noteController';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(listNotes));
router.get('/export', asyncHandler(exportNotes));
router.post('/import', validate(importNotesSchema), asyncHandler(importNotes));
router.post('/', validate(createNoteSchema), asyncHandler(createNote));
router.get('/:id', asyncHandler(getNote));
router.put('/:id', validate(updateNoteSchema), asyncHandler(updateNote));
router.delete('/:id', asyncHandler(deleteNote));

export default router;
