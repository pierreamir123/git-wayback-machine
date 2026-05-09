export interface Commit {
  hash: string;
  shortHash: string;
  authorName: string;
  authorEmail: string;
  date: string;
  subject: string;
  body: string;
  stats?: {
    insertions: number;
    deletions: number;
    filesChanged: number;
  };
}

export interface BlameLine {
  lineNumber: number;
  commitHash: string;
  author: string;
  timestamp: number;
  content: string;
}

export interface FileHistory {
  filePath: string;
  commits: Commit[];
}

export interface WebviewMessage {
  command: string;
  payload?: any;
}

export interface Insight {
  type: 'hotspot' | 'ownership' | 'churn' | 'stability' | 'milestone';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'info';
  data?: any;
}

export interface FileInsights {
  stabilityScore: number;
  insights: Insight[];
  story: string[];
}
