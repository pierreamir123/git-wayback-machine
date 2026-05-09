import * as vscode from 'vscode';
import { WaybackPanelProvider } from './providers/WaybackPanelProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "git-wayback-machine" is now active!');

  const provider = new WaybackPanelProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.commands.registerCommand('git-wayback.openTimeline', () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        provider.createOrShow(activeEditor.document.uri);
      } else {
        vscode.window.showErrorMessage('No active editor found.');
      }
    })
  );
}

export function deactivate() {}
