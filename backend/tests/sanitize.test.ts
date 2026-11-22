import { expect } from 'chai';
import { MAX_TITLE_LENGTH, sanitizeContent, sanitizeTitle } from '../src/utils/sanitize';

describe('sanitize utils', () => {
  it('keeps safe formatting tags', () => {
    expect(sanitizeContent('<p>Hello <strong>world</strong></p>')).to.equal('<p>Hello <strong>world</strong></p>');
  });

  it('removes scripts and event handlers', () => {
    const dirty = '<p onclick="x()">Hi</p><script>alert(1)</script><iframe src="x"></iframe>';
    expect(sanitizeContent(dirty)).to.equal('<p>Hi</p>');
  });

  it('strips all tags from titles', () => {
    expect(sanitizeTitle('<b>Plan</b> <i>A</i>')).to.equal('Plan A');
  });

  it('keeps ampersands and quotes in titles as plain characters', () => {
    expect(sanitizeTitle('Tom & Jerry "live"')).to.equal('Tom & Jerry "live"');
  });

  it('never returns a title longer than the database column', () => {
    const title = sanitizeTitle('&'.repeat(300));
    expect(title.length).to.equal(MAX_TITLE_LENGTH);
  });
});
