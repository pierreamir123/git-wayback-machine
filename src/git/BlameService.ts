import { BlameLine } from '../shared/types';
import { GitService } from './GitService';
import * as path from 'path';

export class BlameService extends GitService {
  public async getBlame(filePath: string): Promise<BlameLine[]> {
    const repoRoot = await this.getRepoRoot(filePath);
    if (!repoRoot) {
      return [];
    }

    const relativePath = path.relative(repoRoot, filePath);
    
    // git blame -p --porcelain -- <file>
    const blameOutput = await this.execute([
      'blame',
      '-p',
      '--',
      relativePath
    ], repoRoot);

    return this.parseBlame(blameOutput);
  }

  private parseBlame(output: string): BlameLine[] {
    const lines = output.split('\n');
    const blameLines: BlameLine[] = [];
    let currentLine: Partial<BlameLine> = {};
    let lineCount = 0;

    for (const line of lines) {
      if (line.match(/^[0-9a-f]{40}/)) {
        if (currentLine.commitHash) {
          // New block starts, but we need to push based on line count from git blame
        }
        const parts = line.split(' ');
        currentLine.commitHash = parts[0];
        // Line number in file is parts[2]
      } else if (line.startsWith('author ')) {
        currentLine.author = line.substring(7);
      } else if (line.startsWith('author-time ')) {
        currentLine.timestamp = parseInt(line.substring(12), 10);
      } else if (line.startsWith('\t')) {
        currentLine.content = line.substring(1);
        lineCount++;
        blameLines.push({
          lineNumber: lineCount,
          commitHash: currentLine.commitHash!,
          author: currentLine.author || 'Unknown',
          timestamp: currentLine.timestamp || 0,
          content: currentLine.content
        });
      }
    }

    return blameLines;
  }
}
