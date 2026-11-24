import { countWords, greeting, initials, isValidEmail, passwordStrength, stripHtml, timeAgo } from '../src/utils/format';

describe('format utils', () => {
  test('stripHtml removes tags and decodes entities', () => {
    expect(stripHtml('<p>Hello&nbsp;<strong>World</strong></p><p>a &amp; b</p>')).toBe('Hello World a & b');
  });

  test('countWords handles empty and multi-word text', () => {
    expect(countWords('   ')).toBe(0);
    expect(countWords('one two  three')).toBe(3);
  });

  test('timeAgo returns friendly labels', () => {
    const now = new Date('2026-11-21T12:00:00Z');
    expect(timeAgo('2026-11-21T11:59:50Z', now)).toBe('Just now');
    expect(timeAgo('2026-11-21T11:30:00Z', now)).toBe('30 min ago');
    expect(timeAgo('2026-11-21T09:00:00Z', now)).toBe('3 hr ago');
    expect(timeAgo('2026-11-20T10:00:00Z', now)).toBe('Yesterday');
  });

  test('greeting depends on the hour', () => {
    expect(greeting(new Date(2026, 0, 1, 8))).toBe('Good morning');
    expect(greeting(new Date(2026, 0, 1, 14))).toBe('Good afternoon');
    expect(greeting(new Date(2026, 0, 1, 21))).toBe('Good evening');
  });

  test('initials uses the first two words', () => {
    expect(initials('Hafiz M Faizan')).toBe('HM');
    expect(initials('madonna')).toBe('M');
  });

  test('isValidEmail accepts and rejects', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail('nope')).toBe(false);
  });

  test('passwordStrength scores stronger passwords higher', () => {
    expect(passwordStrength('abc').score).toBeLessThan(passwordStrength('Str0ng!Passw0rd').score);
    expect(passwordStrength('Str0ng!Passw0rd').label).toBe('Strong');
  });
});
