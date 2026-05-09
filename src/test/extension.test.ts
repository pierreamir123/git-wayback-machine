import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Git Wayback Machine Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('git-wayback.git-wayback-machine'));
  });

  test('Command should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('git-wayback.openTimeline'));
  });
});
