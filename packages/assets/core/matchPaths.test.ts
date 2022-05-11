import { matchPaths } from './matchPaths.js';

describe('matchPaths', () => {
  it('returns true for equal strings', () => {
    const result = matchPaths('/foo/bar', '/foo/bar');
    expect(result).toBe(true);
  });

  it('returns true for strings with equal endings', () => {
    const result = matchPaths('/foo/bar/baz', 'bar/baz');
    expect(result).toBe(true);
  });

  it('returns false for unequal strings', () => {
    const result = matchPaths('/foo/bar/baz', '/bar/baz');
    expect(result).toBe(false);
  });

  it('returns true for a matching RegExp', () => {
    const result = matchPaths('/foo/bar/baz', /\/b.z$/);
    expect(result).toBe(true);
  });

  it('returns false for a non-matching RegExp', () => {
    const result = matchPaths('/foo/bar/baz', /x$/);
    expect(result).toBe(false);
  });

  it('calls the predicate if provided', () => {
    const predicate = jest.fn();
    matchPaths('/foo/bar/baz', predicate);
    expect(predicate.mock.calls).toEqual([['/foo/bar/baz']]);
  });

  it('returns true if the predicate returns true', () => {
    const result = matchPaths('/foo/bar/baz', () => true);
    expect(result).toBe(true);
  });

  it('returns false if the predicate returns false', () => {
    const result = matchPaths('/foo/bar/baz', () => false);
    expect(result).toBe(false);
  });

  it('tries all options for a match', () => {
    const a = jest.fn(() => false);
    const b = jest.fn(() => false);
    const c = jest.fn(() => false);

    matchPaths('/foo/bar/baz', [a, b, c]);

    expect(a.mock.calls).toEqual([['/foo/bar/baz']]);
    expect(b.mock.calls).toEqual([['/foo/bar/baz']]);
    expect(c.mock.calls).toEqual([['/foo/bar/baz']]);
  });

  it('stops at the first match', () => {
    const a = jest.fn(() => false);
    const b = jest.fn(() => true);
    const c = jest.fn(() => false);

    matchPaths('/foo/bar/baz', [a, b, c]);

    expect(a.mock.calls).toEqual([['/foo/bar/baz']]);
    expect(b.mock.calls).toEqual([['/foo/bar/baz']]);
    expect(c.mock.calls).toEqual([]);
  });
});
