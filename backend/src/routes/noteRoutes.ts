import { Router } from 'express';
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

router.get('/', listNotes);
router.get('/export', exportNotes);
router.post('/import', validate(importNotesSchema), importNotes);
router.post('/', validate(createNoteSchema), createNote);
router.get('/:id', getNote);
router.put('/:id', validate(updateNoteSchema), updateNote);
router.delete('/:id', deleteNote);

export default router;
