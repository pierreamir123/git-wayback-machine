import * as cp from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';
import { normalizeLineEndings } from './PathUtils';
import { platform } from 'os';

export class GitService {
  protected async execute(args: string[], cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Log for debugging purposes
      console.log(`[Git] Executing: git ${args.join(' ')} in ${cwd}`);
      console.log(`[Git] Platform: ${platform()}`);

      // On Windows, explicitly use shell to ensure git is found in PATH
      const options = {
        cwd,
        shell: platform() === 'win32' ? true : false,
        encoding: 'utf8' as const,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large git outputs
      };

      cp.execFile('git', args, options, (error, stdout: string, stderr: string) => {
        if (error) {
          console.error(`[Git] Command failed with error code ${error.code}:`, {
            message: error.message,
            stderr: stderr?.trim(),
            cwd,
            args: args.join(' '),
            platform: platform()
          });
          const errorMsg = stderr?.trim() || error.message || 'Unknown git error';
          reject(new GitError(errorMsg, args.join(' ')));
        } else {
          // Normalize line endings for cross-platform consistency
          console.log(`[Git] Command succeeded, output length: ${stdout.length}`);
          resolve(normalizeLineEndings(stdout));
        }
      });
    });
  }

  public async getRepoRoot(filePath: string): Promise<string | undefined> {
    try {
      const dirPath = path.dirname(filePath);
      console.log(`[Git] Looking for repo root. File path: ${filePath}, Directory: ${dirPath}`);
      const root = await this.execute(['rev-parse', '--show-toplevel'], dirPath);
      const trimmedRoot = root.trim();
      console.log(`[Git] Found repo root: ${trimmedRoot}`);
      return trimmedRoot;
    } catch (e) {
      const errorMsg = e instanceof GitError ? e.message : String(e);
      console.error(`[Git] Failed to find repository:`, { errorMsg, filePath });
      vscode.window.showErrorMessage(
        `Failed to find git repository: ${errorMsg}`
      );
      return undefined;
    }
  }
}

export class GitError extends Error {
  constructor(
    message: string,
    public readonly gitCommand: string
  ) {
    super(message);
    this.name = 'GitError';
  }

  toString(): string {
    return `Git command failed: ${this.gitCommand}\n${this.message}`;
  }
}
