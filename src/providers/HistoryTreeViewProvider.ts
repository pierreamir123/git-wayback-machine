import * as vscode from 'vscode';
import * as path from 'path';
import { HistoryService } from '../git/HistoryService';

export class HistoryTreeViewProvider implements vscode.TreeDataProvider<HistoryItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<HistoryItem | undefined | void> = new vscode.EventEmitter<HistoryItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<HistoryItem | undefined | void> = this._onDidChangeTreeData.event;

  private historyService = new HistoryService();

  constructor() {
    vscode.window.onDidChangeActiveTextEditor(() => this.refresh());
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: HistoryItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: HistoryItem): Promise<HistoryItem[]> {
    if (element) {
      return [];
    }

    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      return [];
    }

    try {
      const history = await this.historyService.getFileHistory(activeEditor.document.uri.fsPath);
      return history.map(commit => new HistoryItem(
        commit.subject,
        commit.authorName,
        commit.date,
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'git-wayback.openTimeline',
          title: 'Open Timeline',
          arguments: [activeEditor.document.uri]
        }
      ));
    } catch (e) {
      return [];
    }
  }
}

class HistoryItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private readonly author: string,
    private readonly date: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.label}\nBy ${this.author} on ${new Date(this.date).toLocaleString()}`;
    this.description = this.author;
    this.iconPath = new vscode.ThemeIcon('git-commit');
  }
}
