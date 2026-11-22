import { Op, WhereOptions } from 'sequelize';
import Note, { NoteColor } from '../models/Note';

export interface NoteFilters {
  search?: string;
  pinned?: boolean;
}

export interface NoteData {
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
}

const escapeLike = (value: string): string => value.replace(/[\\%_]/g, (c) => `\\${c}`);

const findAllByUser = (userId: number, filters: NoteFilters = {}): Promise<Note[]> => {
  const where: WhereOptions<Note> = { userId };
  const conditions: WhereOptions<Note>[] = [];

  if (filters.pinned) {
    conditions.push({ isPinned: true });
  }
  if (filters.search) {
    const term = `%${escapeLike(filters.search)}%`;
    conditions.push({ [Op.or]: [{ title: { [Op.like]: term } }, { content: { [Op.like]: term } }] });
  }

  return Note.findAll({
    where: conditions.length ? { [Op.and]: [where, ...conditions] } : where,
    order: [
      ['isPinned', 'DESC'],
      ['updatedAt', 'DESC'],
    ],
  });
};

const findOne = (id: number, userId: number): Promise<Note | null> =>
  Note.findOne({ where: { id, userId } });

const create = (userId: number, data: NoteData): Promise<Note> => Note.create({ userId, ...data });

const update = async (note: Note, data: Partial<NoteData>): Promise<Note> => note.update(data);

const remove = async (note: Note): Promise<void> => note.destroy();

const bulkCreate = (userId: number, items: NoteData[]): Promise<Note[]> =>
  Note.bulkCreate(items.map((item) => ({ userId, ...item })));

const noteRepository = { findAllByUser, findOne, create, update, remove, bulkCreate };

export default noteRepository;
