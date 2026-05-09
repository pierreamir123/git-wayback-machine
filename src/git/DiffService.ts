import { GitService } from './GitService';
import * as path from 'path';

export class DiffService extends GitService {
  public async getFileAtCommit(filePath: string, commitHash: string): Promise<string> {
    const repoRoot = await this.getRepoRoot(filePath);
    if (!repoRoot) {
      return '';
    }

    const relativePath = path.relative(repoRoot, filePath);
    
    // git show <commit>:<file>
    return this.execute([
      'show',
      `${commitHash}:${relativePath}`
    ], repoRoot);
  }

  public async getDiff(filePath: string, commitA: string, commitB: string): Promise<string> {
    const repoRoot = await this.getRepoRoot(filePath);
    if (!repoRoot) {
      return '';
    }

    const relativePath = path.relative(repoRoot, filePath);
    
    // git diff <commitA> <commitB> -- <file>
    return this.execute([
      'diff',
      commitA,
      commitB,
      '--',
      relativePath
    ], repoRoot);
  }
}
