import { expect } from 'chai';
import sinon from 'sinon';
import noteService from '../src/services/noteService';
import noteRepository from '../src/repositories/noteRepository';
import Note from '../src/models/Note';

const fakeNote = (overrides: Record<string, unknown> = {}): Note =>
  ({
    id: 1,
    userId: 7,
    title: 'Groceries',
    content: '<p>Milk</p>',
    color: 'default',
    isPinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as unknown as Note;

const expectStatus = (promise: Promise<unknown>, status: number): Promise<void> =>
  promise.then(
    () => expect.fail('expected the call to be rejected'),
    (err: unknown) => {
      expect((err as { statusCode: number }).statusCode).to.equal(status);
    },
  );

describe('noteService', () => {
  afterEach(() => sinon.restore());

  it('list returns notes for the user with filters', () => {
    const stub = sinon.stub(noteRepository, 'findAllByUser').resolves([fakeNote()]);
    return noteService.list(7, { search: 'milk' }).then((notes) => {
      expect(notes).to.have.length(1);
      expect(stub.calledWith(7, { search: 'milk' })).to.equal(true);
    });
  });

  it('create strips scripts from content and trims the title', () => {
    const stub = sinon.stub(noteRepository, 'create').resolves(fakeNote());
    return noteService
      .create(7, {
        title: '  Hi  ',
        content: '<p>ok</p><script>alert(1)</script><img src=x onerror=alert(1)>',
        color: 'blue',
        isPinned: false,
      })
      .then(() => {
        const saved = stub.firstCall.args[1];
        expect(saved.title).to.equal('Hi');
        expect(saved.content).to.equal('<p>ok</p>');
      });
  });

  it('create falls back to "Untitled" for an empty title', () => {
    const stub = sinon.stub(noteRepository, 'create').resolves(fakeNote());
    return noteService.create(7, { title: '', content: '', color: 'default', isPinned: false }).then(() => {
      expect(stub.firstCall.args[1].title).to.equal('Untitled');
    });
  });

  it('get throws 404 when the note belongs to someone else', () => {
    sinon.stub(noteRepository, 'findOne').resolves(null);
    return expectStatus(noteService.get(1, 999), 404);
  });

  it('update changes the note', () => {
    sinon.stub(noteRepository, 'findOne').resolves(fakeNote());
    const update = sinon.stub(noteRepository, 'update').resolves(fakeNote({ isPinned: true }));
    return noteService.update(1, 7, { isPinned: true }).then((result) => {
      expect(update.calledOnce).to.equal(true);
      expect(result.isPinned).to.equal(true);
    });
  });

  it('update throws 404 for a missing note', () => {
    sinon.stub(noteRepository, 'findOne').resolves(null);
    return expectStatus(noteService.update(1, 7, { title: 'x' }), 404);
  });

  it('remove deletes an owned note', () => {
    sinon.stub(noteRepository, 'findOne').resolves(fakeNote());
    const remove = sinon.stub(noteRepository, 'remove').resolves();
    return noteService.remove(1, 7).then(() => {
      expect(remove.calledOnce).to.equal(true);
    });
  });

  it('exportAll returns only portable fields', () => {
    sinon.stub(noteRepository, 'findAllByUser').resolves([fakeNote()]);
    return noteService.exportAll(7).then((exported) => {
      expect(exported[0]).to.have.all.keys('title', 'content', 'color', 'isPinned');
    });
  });

  it('importing an exported title keeps it exactly as exported', () => {
    const exportedTitle = '&lt;b&gt;Plan&lt;/b&gt; & more';
    const stub = sinon.stub(noteRepository, 'bulkCreate').resolves([fakeNote()]);
    return noteService
      .importMany(7, [{ title: exportedTitle, content: '<p>a</p>', color: 'default', isPinned: false }])
      .then(() => {
        expect(stub.firstCall.args[1][0].title).to.equal(exportedTitle);
      });
  });

  it('importMany returns the number of imported notes', () => {
    const stub = sinon.stub(noteRepository, 'bulkCreate').resolves([fakeNote(), fakeNote({ id: 2 })]);
    return noteService
      .importMany(7, [
        { title: 'A', content: '<p>a</p>', color: 'default', isPinned: false },
        { title: 'B', content: '<p>b</p>', color: 'red', isPinned: true },
      ])
      .then((count) => {
        expect(count).to.equal(2);
        expect(stub.calledOnce).to.equal(true);
      });
  });
});
