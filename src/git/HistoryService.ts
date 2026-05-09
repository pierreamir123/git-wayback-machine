import { Commit } from '../shared/types';
import { GitService } from './GitService';
import * as path from 'path';

export class HistoryService extends GitService {
  public async getFileHistory(filePath: string): Promise<Commit[]> {
    const repoRoot = await this.getRepoRoot(filePath);
    if (!repoRoot) {
      return [];
    }

    const relativePath = path.relative(repoRoot, filePath);
    
    // git log --follow --format='%H|%h|%an|%ae|%ad|%s|%b' --date=iso -- <file>
    const logOutput = await this.execute([
      'log',
      '--follow',
      '--format=%H|%h|%an|%ae|%ad|%s|%b<END_COMMIT>',
      '--date=iso',
      '--',
      relativePath
    ], repoRoot);

    return this.parseCommits(logOutput);
  }

  private parseCommits(logOutput: string): Commit[] {
    const commitBlocks = logOutput.split('<END_COMMIT>').filter(b => b.trim() !== '');
    return commitBlocks.map(block => {
      const [hash, shortHash, authorName, authorEmail, date, subject, body] = block.trim().split('|');
      return {
        hash,
        shortHash,
        authorName,
        authorEmail,
        date,
        subject,
        body: body || ''
      };
    });
  }
}
