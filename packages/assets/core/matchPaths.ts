/**
 * Used to match files.
 */
export type MatchPathPredicate = string | RegExp | ((file: string) => boolean);

/**
 * Returns true if the patch matches the match object
 * @param path The path to match
 * @param match The instance to compare
 */
export function matchPaths(
  path: string,
  match: MatchPathPredicate | MatchPathPredicate[],
): boolean {
  if (Array.isArray(match)) {
    return match.some((x) => matchPaths(path, x));
  }
  if (typeof match === 'function') {
    return match(path);
  }
  if (match instanceof RegExp) {
    return match.test(path);
  }
  return (
    path === match || (!match.startsWith('/') && path.endsWith('/' + match))
  );
}
