import { BlameLine } from '../shared/types';
import { GitService, GitError } from './GitService';
import * as path from 'path';
import * as vscode from 'vscode';
import { toGitPath } from './PathUtils';

export class BlameService extends GitService {
  public async getBlame(filePath: string): Promise<BlameLine[]> {
    const repoRoot = await this.getRepoRoot(filePath);
    if (!repoRoot) {
      return [];
    }

    const relativePath = toGitPath(path.relative(repoRoot, filePath));

    try {
      // git blame -p --porcelain -- <file>
      const blameOutput = await this.execute([
        'blame',
        '-p',
        '--',
        relativePath
      ], repoRoot);

      return this.parseBlame(blameOutput);
    } catch (e) {
      const errMsg = e instanceof GitError ? e.message : String(e);
      vscode.window.showErrorMessage(`Failed to get blame for file: ${errMsg}`);
      return [];
    }
  }

  private parseBlame(output: string): BlameLine[] {
    const lines = output.split('\n');
    const blameLines: BlameLine[] = [];
    let currentLine: Partial<BlameLine> = {};
    let lineCount = 0;

    for (const line of lines) {
      if (line.match(/^[0-9a-f]{40}/)) {
        const parts = line.split(' ');
        currentLine.commitHash = parts[0];
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
