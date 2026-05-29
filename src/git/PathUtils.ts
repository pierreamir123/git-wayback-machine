// Utilities for cross-platform path handling in git commands

/**
 * Normalize a file path to use forward slashes (required for git commands on all platforms).
 * Git always expects forward slashes in paths, even on Windows.
 */
export function toGitPath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Normalize line endings from git output to always use \n.
 * Handles both Windows (\r\n) and Unix (\n) line endings.
 */
export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

/**
 * Quote a path if it contains spaces or special characters.
 * Used for passing to git commands safely.
 */
export function quotePath(filePath: string): string {
  if (filePath.includes(' ') || filePath.includes('"') || filePath.includes("'")) {
    // Escape any quotes in the path
    return `"${filePath.replace(/"/g, '\\"')}"`;
  }
  return filePath;
}
