import * as cp from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';
import { normalizeLineEndings } from './PathUtils';

export class GitService {
  protected async execute(args: string[], cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cp.execFile('git', args, { cwd }, (error, stdout, stderr) => {
        if (error) {
          const errorMsg = stderr?.trim() || error.message || 'Unknown git error';
          reject(new GitError(errorMsg, args.join(' ')));
        } else {
          // Normalize line endings for cross-platform consistency
          resolve(normalizeLineEndings(stdout));
        }
      });
    });
  }

  public async getRepoRoot(filePath: string): Promise<string | undefined> {
    try {
      const root = await this.execute(['rev-parse', '--show-toplevel'], path.dirname(filePath));
      return root.trim();
    } catch (e) {
      vscode.window.showErrorMessage(
        `Failed to find git repository: ${e instanceof GitError ? e.message : String(e)}`
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
