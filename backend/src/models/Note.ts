import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from '../config/database';

export const NOTE_COLORS = ['default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];

class Note extends Model<InferAttributes<Note>, InferCreationAttributes<Note>> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare title: string;
  declare content: string;
  declare color: CreationOptional<NoteColor>;
  declare isPinned: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Note.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false, defaultValue: 'Untitled' },
    content: { type: DataTypes.TEXT('long'), allowNull: false },
    color: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'default' },
    isPinned: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: 'notes' },
);

export default Note;
