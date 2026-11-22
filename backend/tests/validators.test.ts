import { expect } from 'chai';
import { loginSchema, signupSchema } from '../src/validators/authValidators';
import { createNoteSchema, importNotesSchema, updateNoteSchema } from '../src/validators/noteValidators';

describe('validators', () => {
  it('accepts a valid signup payload', () => {
    const { error } = signupSchema.validate({ name: 'Hafiz', email: 'h@example.com', password: 'Password123' });
    expect(error).to.equal(undefined);
  });

  it('rejects passwords longer than 72 UTF-8 bytes', () => {
    const multibyte = 'é'.repeat(35) + 'A1x'; // 73 bytes, only 38 characters
    const { error } = signupSchema.validate({ name: 'Hafiz', email: 'h@example.com', password: multibyte });
    expect(error).to.not.equal(undefined);
  });

  it('requires an object for the root schemas', () => {
    expect(loginSchema.required().validate(undefined).error).to.not.equal(undefined);
    expect(createNoteSchema.required().validate(undefined).error).to.not.equal(undefined);
  });

  it('applies defaults when creating a note', () => {
    const { value } = createNoteSchema.validate({});
    expect(value).to.deep.equal({ title: 'Untitled', content: '', color: 'default', isPinned: false });
  });

  it('rejects titles containing angle brackets everywhere a title is accepted', () => {
    const bad = '<span title="a < b">Plan</span>';
    expect(createNoteSchema.validate({ title: bad }).error).to.not.equal(undefined);
    expect(updateNoteSchema.validate({ title: bad }).error).to.not.equal(undefined);
    expect(importNotesSchema.validate({ notes: [{ title: bad }] }).error).to.not.equal(undefined);
  });

  it('accepts ordinary titles with symbols', () => {
    expect(createNoteSchema.validate({ title: 'Tom & Jerry: 50% off!' }).error).to.equal(undefined);
  });

  it('rejects an empty update and an empty import', () => {
    expect(updateNoteSchema.validate({}).error).to.not.equal(undefined);
    expect(importNotesSchema.validate({ notes: [] }).error).to.not.equal(undefined);
  });
});
