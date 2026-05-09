import * as vscode from 'vscode';
import { WaybackPanelProvider } from './providers/WaybackPanelProvider';
import { HistoryTreeViewProvider } from './providers/HistoryTreeViewProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "git-wayback-machine" is now active!');

  const provider = new WaybackPanelProvider(context.extensionUri);
  const treeProvider = new HistoryTreeViewProvider();

  vscode.window.registerTreeDataProvider('git-wayback-history', treeProvider);

  context.subscriptions.push(
    vscode.commands.registerCommand('git-wayback.openTimeline', (fileUri?: vscode.Uri) => {
      const uri = fileUri || vscode.window.activeTextEditor?.document.uri;
      if (uri) {
        provider.createOrShow(uri);
      } else {
        vscode.window.showErrorMessage('No active editor found.');
      }
    })
  );
}

export function deactivate() {}
