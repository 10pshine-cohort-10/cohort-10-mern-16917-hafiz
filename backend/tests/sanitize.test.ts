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
    expect(sanitizeTitle('&'.repeat(300)).length).to.equal(MAX_TITLE_LENGTH);
  });

  it('is idempotent, so exported titles survive a re-import unchanged', () => {
    const samples = [
      '&lt;b&gt;Plan&lt;/b&gt;',
      '<b>Plan</b>',
      'Tom & Jerry',
      'a < b and c > d',
      '<<b>script>x</script>',
      '  padded  ',
    ];
    samples.forEach((sample) => {
      const once = sanitizeTitle(sample);
      expect(sanitizeTitle(once)).to.equal(once);
    });
  });

  it('keeps comparison text that only looks like markup', () => {
    expect(sanitizeTitle('a < b and c > d')).to.equal('a < b and c > d');
    expect(sanitizeTitle('x <3 y > z')).to.equal('x <3 y > z');
  });

  it('keeps escaped text that is not real markup exactly as typed', () => {
    expect(sanitizeTitle('&lt;b&gt;Plan&lt;/b&gt;')).to.equal('&lt;b&gt;Plan&lt;/b&gt;');
  });
});