import * as vscode from 'vscode';
import * as path from 'path';
import { HistoryService } from '../git/HistoryService';
import { DiffService } from '../git/DiffService';
import { BlameService } from '../git/BlameService';

export class WaybackPanelProvider {
  public static readonly viewType = 'gitWaybackTimeline';
  private _panel: vscode.WebviewPanel | undefined;
  private readonly _historyService: HistoryService;
  private readonly _diffService: DiffService;
  private readonly _blameService: BlameService;
  private _currentFileUri: vscode.Uri | undefined;

  constructor(private readonly _extensionUri: vscode.Uri) {
    this._historyService = new HistoryService();
    this._diffService = new DiffService();
    this._blameService = new BlameService();
  }

  public async createOrShow(fileUri: vscode.Uri) {
    this._currentFileUri = fileUri;
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (this._panel) {
      this._panel.reveal(column);
      this._updateForFile(fileUri);
      return;
    }

    this._panel = vscode.window.createWebviewPanel(
      WaybackPanelProvider.viewType,
      'Git Wayback Timeline',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this._extensionUri, 'webview', 'dist'),
          vscode.Uri.joinPath(this._extensionUri, 'webview', 'public')
        ]
      }
    );

    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    this._panel.onDidDispose(() => {
      this._panel = undefined;
    }, null, []);

    this._panel.webview.onDidReceiveMessage(
      async message => {
        switch (message.command) {
          case 'ready':
            this._updateForFile(fileUri);
            return;
          case 'selectCommit':
            this._handleSelectCommit(message.payload.hash);
            return;
          case 'alert':
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null,
      []
    );
  }

  private async _handleSelectCommit(hash: string) {
    if (!this._panel || !this._currentFileUri) {
      return;
    }

    try {
      const content = await this._diffService.getFileAtCommit(this._currentFileUri.fsPath, hash);
      this._panel.webview.postMessage({
        command: 'setFileContent',
        payload: {
          hash,
          content
        }
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to fetch file content: ${error}`);
    }
  }

  private async _updateForFile(fileUri: vscode.Uri) {
    if (!this._panel) {
      return;
    }

    try {
      const [history, blame] = await Promise.all([
        this._historyService.getFileHistory(fileUri.fsPath),
        this._blameService.getBlame(fileUri.fsPath)
      ]);

      this._panel.webview.postMessage({
        command: 'setData',
        payload: {
          filePath: fileUri.fsPath,
          commits: history,
          blame: blame
        }
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to get git data: ${error}`);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'webview', 'dist', 'assets', 'index.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'webview', 'dist', 'assets', 'index.css')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
        <link href="${styleUri}" rel="stylesheet">
        <title>Git Wayback Timeline</title>
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
