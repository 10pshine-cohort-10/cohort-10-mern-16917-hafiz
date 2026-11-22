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

  it('keeps ampersands and quotes in titles as plain characters', () => {
    expect(sanitizeTitle('Tom & Jerry "live"')).to.equal('Tom & Jerry "live"');
  });

  it('never lets markup survive in a title', () => {
    const attacks = [
      '<span title="a < b">Plan</span>',
      '<img src=x onerror="alert(1)// < 2">',
      '<<b>script>alert(1)</script>',
      '<b>Plan</b>',
    ];
    attacks.forEach((attack) => {
      const cleaned = sanitizeTitle(attack);
      expect(cleaned).to.not.contain('<');
      expect(cleaned).to.not.contain('>');
    });
  });

  it('never returns a title longer than the database column', () => {
    expect(sanitizeTitle('&'.repeat(300)).length).to.equal(MAX_TITLE_LENGTH);
  });

  it('is idempotent, so exported titles survive a re-import unchanged', () => {
    const samples = ['&lt;b&gt;Plan&lt;/b&gt;', 'Tom & Jerry', '<b>Plan</b>', `${'x'.repeat(254)} y`, '  padded  '];
    samples.forEach((sample) => {
      const once = sanitizeTitle(sample);
      expect(sanitizeTitle(once)).to.equal(once);
    });
  });

  it('keeps escaped text exactly as typed', () => {
    expect(sanitizeTitle('&lt;b&gt;Plan&lt;/b&gt;')).to.equal('&lt;b&gt;Plan&lt;/b&gt;');
  });
});
