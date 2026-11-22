import User from './User';
import Note from './Note';

User.hasMany(Note, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'notes' });
Note.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

export { User, Note };
