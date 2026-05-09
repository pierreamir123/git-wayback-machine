import * as cp from 'child_process';
import * as path from 'path';
import * as vscode from 'vscode';

export class GitService {
  protected async execute(args: string[], cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cp.execFile('git', args, { cwd }, (error, stdout, stderr) => {
        if (error) {
          reject(stderr || error.message);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  public async getRepoRoot(filePath: string): Promise<string | undefined> {
    try {
      const root = await this.execute(['rev-parse', '--show-toplevel'], path.dirname(filePath));
      return root.trim();
    } catch (e) {
      return undefined;
    }
  }
}
