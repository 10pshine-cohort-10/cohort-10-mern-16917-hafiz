import Joi from 'joi';
import { NOTE_COLORS } from '../models/Note';

const noteFields = {
  title: Joi.string().trim().allow('').max(255),
  content: Joi.string().allow('').max(1_000_000),
  color: Joi.string().valid(...NOTE_COLORS),
  isPinned: Joi.boolean(),
};

export const createNoteSchema = Joi.object({
  title: noteFields.title.default('Untitled'),
  content: noteFields.content.default(''),
  color: noteFields.color.default('default'),
  isPinned: noteFields.isPinned.default(false),
});

export const updateNoteSchema = Joi.object(noteFields).min(1);

export const importNotesSchema = Joi.object({
  notes: Joi.array()
    .items(
      Joi.object({
        title: noteFields.title.default('Untitled'),
        content: noteFields.content.default(''),
        color: noteFields.color.default('default'),
        isPinned: noteFields.isPinned.default(false),
      }),
    )
    .min(1)
    .max(500)
    .required(),
});
