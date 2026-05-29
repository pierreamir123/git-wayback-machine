import { GitService, GitError } from './GitService';
import * as path from 'path';
import * as vscode from 'vscode';
import { toGitPath } from './PathUtils';

export class DiffService extends GitService {
  public async getFileAtCommit(filePath: string, commitHash: string): Promise<string> {
    const repoRoot = await this.getRepoRoot(filePath);
    if (!repoRoot) {
      return '';
    }

    const relativePath = toGitPath(path.relative(repoRoot, filePath));

    try {
      // git show <commit>:<file> - git requires forward slashes in path
      return await this.execute([
        'show',
        `${commitHash}:${relativePath}`
      ], repoRoot);
    } catch (e) {
      const errMsg = e instanceof GitError ? e.message : String(e);
      vscode.window.showErrorMessage(`Failed to load file at commit ${commitHash.slice(0, 7)}: ${errMsg}`);
      return '';
    }
  }

  public async getDiff(filePath: string, commitA: string, commitB: string): Promise<string> {
    const repoRoot = await this.getRepoRoot(filePath);
    if (!repoRoot) {
      return '';
    }

    const relativePath = toGitPath(path.relative(repoRoot, filePath));

    try {
      // git diff <commitA> <commitB> -- <file>
      return await this.execute([
        'diff',
        commitA,
        commitB,
        '--',
        relativePath
      ], repoRoot);
    } catch (e) {
      const errMsg = e instanceof GitError ? e.message : String(e);
      vscode.window.showErrorMessage(`Failed to get diff: ${errMsg}`);
      return '';
    }
  }
}
