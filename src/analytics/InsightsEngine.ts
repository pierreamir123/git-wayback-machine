import { Commit, BlameLine, Insight, FileInsights } from '../shared/types';

export class InsightsEngine {
  public analyze(commits: Commit[], blame: BlameLine[]): FileInsights {
    const insights: Insight[] = [];
    
    // 1. Stability Score Calculation
    const stabilityScore = this.calculateStabilityScore(commits, blame);
    
    // 2. Detect Hotspots (High Churn)
    const hotspots = this.detectHotspots(blame, commits);
    if (hotspots) insights.push(hotspots);

    // 3. Ownership Shifts
    const ownershipInsight = this.detectOwnershipShifts(commits);
    if (ownershipInsight) insights.push(ownershipInsight);

    // 4. Milestone Detection
    const milestone = this.detectMilestones(commits);
    if (milestone) insights.push(milestone);

    // 5. Generate Story
    const story = this.generateStory(commits, blame);

    return {
      stabilityScore,
      insights,
      story
    };
  }

  private calculateStabilityScore(commits: Commit[], blame: BlameLine[]): number {
    if (commits.length === 0) return 100;
    
    // Factors: commit frequency, number of authors, file age vs changes
    const authorCount = new Set(commits.map(c => c.authorEmail)).size;
    const churnRate = commits.length / 10; // Simple heuristic: commits per "unit"
    
    let score = 100 - (churnRate * 5) - (authorCount * 2);
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private detectHotspots(blame: BlameLine[], commits: Commit[]): Insight | null {
    const commitCounts: Record<string, number> = {};
    blame.forEach(line => {
      commitCounts[line.commitHash] = (commitCounts[line.commitHash] || 0) + 1;
    });

    const topCommit = Object.entries(commitCounts).sort((a, b) => b[1] - a[1])[0];
    if (topCommit && topCommit[1] > blame.length * 0.3) {
      return {
        type: 'hotspot',
        title: 'High Churn Area',
        description: `Over ${Math.round((topCommit[1] / blame.length) * 100)}% of this file was modified in a single commit (${topCommit[0].substring(0, 7)}).`,
        severity: 'medium'
      };
    }
    return null;
  }

  private detectOwnershipShifts(commits: Commit[]): Insight | null {
    if (commits.length < 5) return null;
    
    const firstAuthor = commits[commits.length - 1].authorName;
    const latestAuthor = commits[0].authorName;

    if (firstAuthor !== latestAuthor) {
      return {
        type: 'ownership',
        title: 'Ownership Shift',
        description: `This file was originally created by ${firstAuthor}, but has recently been maintained by ${latestAuthor}.`,
        severity: 'info'
      };
    }
    return null;
  }

  private detectMilestones(commits: Commit[]): Insight | null {
    const majorCommits = commits.filter(c => c.subject.toLowerCase().includes('refactor') || c.subject.toLowerCase().includes('rewrite'));
    if (majorCommits.length > 0) {
      return {
        type: 'milestone',
        title: 'Major Refactoring',
        description: `This file has undergone ${majorCommits.length} significant refactoring sessions.`,
        severity: 'low'
      };
    }
    return null;
  }

  private generateStory(commits: Commit[], blame: BlameLine[]): string[] {
    const story: string[] = [];
    if (commits.length === 0) return story;

    const creator = commits[commits.length - 1];
    const latest = commits[0];

    story.push(`First created on ${new Date(creator.date).toLocaleDateString()} by ${creator.authorName}.`);
    
    if (commits.length > 1) {
      story.push(`Since then, it has evolved through ${commits.length} commits.`);
    }

    const uniqueAuthors = new Set(commits.map(c => c.authorName)).size;
    if (uniqueAuthors > 1) {
      story.push(`A total of ${uniqueAuthors} developers have contributed to this file.`);
    }

    story.push(`The most recent update was by ${latest.authorName} on ${new Date(latest.date).toLocaleDateString()}.`);

    return story;
  }
}
