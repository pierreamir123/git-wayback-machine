/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
const WaybackPanelProvider_1 = __webpack_require__(2);
const HistoryTreeViewProvider_1 = __webpack_require__(11);
function activate(context) {
    console.log('Congratulations, your extension "git-wayback-machine" is now active!');
    const provider = new WaybackPanelProvider_1.WaybackPanelProvider(context.extensionUri);
    const treeProvider = new HistoryTreeViewProvider_1.HistoryTreeViewProvider();
    vscode.window.registerTreeDataProvider('git-wayback-history', treeProvider);
    context.subscriptions.push(vscode.commands.registerCommand('git-wayback.openTimeline', (fileUri) => {
        const uri = fileUri || vscode.window.activeTextEditor?.document.uri;
        if (uri) {
            provider.createOrShow(uri);
        }
        else {
            vscode.window.showErrorMessage('No active editor found.');
        }
    }));
}
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WaybackPanelProvider = void 0;
const vscode = __importStar(__webpack_require__(1));
const path = __importStar(__webpack_require__(3));
const HistoryService_1 = __webpack_require__(4);
const DiffService_1 = __webpack_require__(8);
const BlameService_1 = __webpack_require__(9);
const InsightsEngine_1 = __webpack_require__(10);
class WaybackPanelProvider {
    _extensionUri;
    static viewType = 'gitWaybackTimeline';
    _panel;
    _historyService;
    _diffService;
    _blameService;
    _insightsEngine;
    _currentFileUri;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this._historyService = new HistoryService_1.HistoryService();
        this._diffService = new DiffService_1.DiffService();
        this._blameService = new BlameService_1.BlameService();
        this._insightsEngine = new InsightsEngine_1.InsightsEngine();
    }
    async createOrShow(fileUri) {
        this._currentFileUri = fileUri;
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        if (this._panel) {
            this._panel.reveal(column);
            this._updateForFile(fileUri);
            return;
        }
        this._panel = vscode.window.createWebviewPanel(WaybackPanelProvider.viewType, 'Git Wayback Timeline', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri,
                vscode.Uri.joinPath(this._extensionUri, 'webview', 'dist'),
                vscode.Uri.joinPath(this._extensionUri, 'webview', 'public')
            ]
        });
        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
        this._panel.onDidDispose(() => {
            this._panel = undefined;
        }, null, []);
        this._panel.webview.onDidReceiveMessage(async (message) => {
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
        }, null, []);
    }
    async _handleSelectCommit(hash) {
        if (!this._panel || !this._currentFileUri) {
            return;
        }
        try {
            const history = await this._historyService.getFileHistory(this._currentFileUri.fsPath);
            const currentIndex = history.findIndex(c => c.hash === hash);
            let addedLines = [];
            let content = '';
            if (currentIndex !== -1) {
                content = await this._diffService.getFileAtCommit(this._currentFileUri.fsPath, hash);
                if (currentIndex < history.length - 1) {
                    const prevHash = history[currentIndex + 1].hash;
                    const diff = await this._diffService.getDiff(this._currentFileUri.fsPath, prevHash, hash);
                    addedLines = this._parseAddedLinesFromDiff(diff);
                }
                else {
                    addedLines = content.split('\n').map((_, i) => i + 1);
                }
            }
            this._panel.webview.postMessage({
                command: 'setFileContent',
                payload: {
                    hash,
                    content,
                    addedLines
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to fetch file content: ${error}`);
        }
    }
    _parseAddedLinesFromDiff(diff) {
        const addedLines = [];
        const chunks = diff.split(/^@@/m).slice(1);
        for (const chunk of chunks) {
            // Match: @@ -oldStart,count +newStart,count @@ or @@ -oldStart +newStart @@
            const headerMatch = chunk.match(/ \+(\d+)(?:,(\d+))?/);
            if (!headerMatch)
                continue;
            let currentLine = parseInt(headerMatch[1], 10);
            const lines = chunk.split('\n').slice(1);
            for (const line of lines) {
                if (line.startsWith('+') && !line.startsWith('+++')) {
                    addedLines.push(currentLine);
                    currentLine++;
                }
                else if (!line.startsWith('-') && line.length > 0) {
                    // Context line (space prefix) or empty - advance line counter
                    currentLine++;
                }
                // Lines starting with '-' don't advance currentLine
            }
        }
        return addedLines;
    }
    async _updateForFile(fileUri) {
        if (!this._panel) {
            return;
        }
        try {
            // Show loading indicator
            this._panel.webview.postMessage({
                command: 'setLoading',
                payload: { isLoading: true }
            });
            const [history, blame] = await Promise.all([
                this._historyService.getFileHistory(fileUri.fsPath),
                this._blameService.getBlame(fileUri.fsPath)
            ]);
            if (history.length === 0) {
                vscode.window.showWarningMessage(`No git history found for ${path.basename(fileUri.fsPath)}. ` +
                    'Is this file tracked by git?');
            }
            const insights = this._insightsEngine.analyze(history, blame);
            this._panel.webview.postMessage({
                command: 'setData',
                payload: {
                    filePath: fileUri.fsPath,
                    commits: history,
                    blame: blame,
                    insights: insights,
                    logoUri: this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'logo.svg')).toString()
                }
            });
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to load git history: ${errorMsg}`);
            this._panel?.webview.postMessage({
                command: 'setError',
                payload: { error: errorMsg }
            });
        }
    }
    _getHtmlForWebview(webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'webview', 'dist', 'assets', 'index.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'webview', 'dist', 'assets', 'index.css'));
        const nonce = getNonce();
        return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} data:;">
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
exports.WaybackPanelProvider = WaybackPanelProvider;
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HistoryService = void 0;
const GitService_1 = __webpack_require__(5);
const path = __importStar(__webpack_require__(3));
const PathUtils_1 = __webpack_require__(7);
class HistoryService extends GitService_1.GitService {
    async getFileHistory(filePath) {
        const repoRoot = await this.getRepoRoot(filePath);
        if (!repoRoot) {
            return [];
        }
        const relativePath = (0, PathUtils_1.toGitPath)(path.relative(repoRoot, filePath));
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
    parseCommits(logOutput) {
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
exports.HistoryService = HistoryService;


/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GitError = exports.GitService = void 0;
const cp = __importStar(__webpack_require__(6));
const path = __importStar(__webpack_require__(3));
const vscode = __importStar(__webpack_require__(1));
const PathUtils_1 = __webpack_require__(7);
class GitService {
    async execute(args, cwd) {
        return new Promise((resolve, reject) => {
            cp.execFile('git', args, { cwd }, (error, stdout, stderr) => {
                if (error) {
                    const errorMsg = stderr?.trim() || error.message || 'Unknown git error';
                    reject(new GitError(errorMsg, args.join(' ')));
                }
                else {
                    // Normalize line endings for cross-platform consistency
                    resolve((0, PathUtils_1.normalizeLineEndings)(stdout));
                }
            });
        });
    }
    async getRepoRoot(filePath) {
        try {
            const root = await this.execute(['rev-parse', '--show-toplevel'], path.dirname(filePath));
            return root.trim();
        }
        catch (e) {
            vscode.window.showErrorMessage(`Failed to find git repository: ${e instanceof GitError ? e.message : String(e)}`);
            return undefined;
        }
    }
}
exports.GitService = GitService;
class GitError extends Error {
    gitCommand;
    constructor(message, gitCommand) {
        super(message);
        this.gitCommand = gitCommand;
        this.name = 'GitError';
    }
    toString() {
        return `Git command failed: ${this.gitCommand}\n${this.message}`;
    }
}
exports.GitError = GitError;


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports) => {


// Utilities for cross-platform path handling in git commands
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toGitPath = toGitPath;
exports.normalizeLineEndings = normalizeLineEndings;
exports.quotePath = quotePath;
/**
 * Normalize a file path to use forward slashes (required for git commands on all platforms).
 * Git always expects forward slashes in paths, even on Windows.
 */
function toGitPath(filePath) {
    return filePath.replace(/\\/g, '/');
}
/**
 * Normalize line endings from git output to always use \n.
 * Handles both Windows (\r\n) and Unix (\n) line endings.
 */
function normalizeLineEndings(text) {
    return text.replace(/\r\n/g, '\n');
}
/**
 * Quote a path if it contains spaces or special characters.
 * Used for passing to git commands safely.
 */
function quotePath(filePath) {
    if (filePath.includes(' ') || filePath.includes('"') || filePath.includes("'")) {
        // Escape any quotes in the path
        return `"${filePath.replace(/"/g, '\\"')}"`;
    }
    return filePath;
}


/***/ }),
/* 8 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DiffService = void 0;
const GitService_1 = __webpack_require__(5);
const path = __importStar(__webpack_require__(3));
const vscode = __importStar(__webpack_require__(1));
const PathUtils_1 = __webpack_require__(7);
class DiffService extends GitService_1.GitService {
    async getFileAtCommit(filePath, commitHash) {
        const repoRoot = await this.getRepoRoot(filePath);
        if (!repoRoot) {
            return '';
        }
        const relativePath = (0, PathUtils_1.toGitPath)(path.relative(repoRoot, filePath));
        try {
            // git show <commit>:<file> - git requires forward slashes in path
            return await this.execute([
                'show',
                `${commitHash}:${relativePath}`
            ], repoRoot);
        }
        catch (e) {
            const errMsg = e instanceof GitService_1.GitError ? e.message : String(e);
            vscode.window.showErrorMessage(`Failed to load file at commit ${commitHash.slice(0, 7)}: ${errMsg}`);
            return '';
        }
    }
    async getDiff(filePath, commitA, commitB) {
        const repoRoot = await this.getRepoRoot(filePath);
        if (!repoRoot) {
            return '';
        }
        const relativePath = (0, PathUtils_1.toGitPath)(path.relative(repoRoot, filePath));
        try {
            // git diff <commitA> <commitB> -- <file>
            return await this.execute([
                'diff',
                commitA,
                commitB,
                '--',
                relativePath
            ], repoRoot);
        }
        catch (e) {
            const errMsg = e instanceof GitService_1.GitError ? e.message : String(e);
            vscode.window.showErrorMessage(`Failed to get diff: ${errMsg}`);
            return '';
        }
    }
}
exports.DiffService = DiffService;


/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BlameService = void 0;
const GitService_1 = __webpack_require__(5);
const path = __importStar(__webpack_require__(3));
const vscode = __importStar(__webpack_require__(1));
const PathUtils_1 = __webpack_require__(7);
class BlameService extends GitService_1.GitService {
    async getBlame(filePath) {
        const repoRoot = await this.getRepoRoot(filePath);
        if (!repoRoot) {
            return [];
        }
        const relativePath = (0, PathUtils_1.toGitPath)(path.relative(repoRoot, filePath));
        try {
            // git blame -p --porcelain -- <file>
            const blameOutput = await this.execute([
                'blame',
                '-p',
                '--',
                relativePath
            ], repoRoot);
            return this.parseBlame(blameOutput);
        }
        catch (e) {
            const errMsg = e instanceof GitService_1.GitError ? e.message : String(e);
            vscode.window.showErrorMessage(`Failed to get blame for file: ${errMsg}`);
            return [];
        }
    }
    parseBlame(output) {
        const lines = output.split('\n');
        const blameLines = [];
        let currentLine = {};
        let lineCount = 0;
        for (const line of lines) {
            if (line.match(/^[0-9a-f]{40}/)) {
                const parts = line.split(' ');
                currentLine.commitHash = parts[0];
            }
            else if (line.startsWith('author ')) {
                currentLine.author = line.substring(7);
            }
            else if (line.startsWith('author-time ')) {
                currentLine.timestamp = parseInt(line.substring(12), 10);
            }
            else if (line.startsWith('\t')) {
                currentLine.content = line.substring(1);
                lineCount++;
                blameLines.push({
                    lineNumber: lineCount,
                    commitHash: currentLine.commitHash,
                    author: currentLine.author || 'Unknown',
                    timestamp: currentLine.timestamp || 0,
                    content: currentLine.content
                });
            }
        }
        return blameLines;
    }
}
exports.BlameService = BlameService;


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InsightsEngine = void 0;
class InsightsEngine {
    analyze(commits, blame) {
        const insights = [];
        // 1. Stability Score Calculation
        const stabilityScore = this.calculateStabilityScore(commits, blame);
        // 2. Detect Hotspots (High Churn)
        const hotspots = this.detectHotspots(blame, commits);
        if (hotspots)
            insights.push(hotspots);
        // 3. Ownership Shifts
        const ownershipInsight = this.detectOwnershipShifts(commits);
        if (ownershipInsight)
            insights.push(ownershipInsight);
        // 4. Milestone Detection
        const milestone = this.detectMilestones(commits);
        if (milestone)
            insights.push(milestone);
        // 5. Generate Story
        const story = this.generateStory(commits, blame);
        return {
            stabilityScore,
            insights,
            story
        };
    }
    calculateStabilityScore(commits, blame) {
        if (commits.length === 0)
            return 100;
        // Factors: commit frequency, number of authors, file age vs changes
        const authorCount = new Set(commits.map(c => c.authorEmail)).size;
        const churnRate = commits.length / 10; // Simple heuristic: commits per "unit"
        let score = 100 - (churnRate * 5) - (authorCount * 2);
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    detectHotspots(blame, commits) {
        const commitCounts = {};
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
    detectOwnershipShifts(commits) {
        if (commits.length < 5)
            return null;
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
    detectMilestones(commits) {
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
    generateStory(commits, blame) {
        const story = [];
        if (commits.length === 0)
            return story;
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
exports.InsightsEngine = InsightsEngine;


/***/ }),
/* 11 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HistoryTreeViewProvider = void 0;
const vscode = __importStar(__webpack_require__(1));
const HistoryService_1 = __webpack_require__(4);
class HistoryTreeViewProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    historyService = new HistoryService_1.HistoryService();
    constructor() {
        vscode.window.onDidChangeActiveTextEditor(() => this.refresh());
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (element) {
            return [];
        }
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return [];
        }
        try {
            const history = await this.historyService.getFileHistory(activeEditor.document.uri.fsPath);
            return history.map(commit => new HistoryItem(commit.subject, commit.authorName, commit.date, vscode.TreeItemCollapsibleState.None, {
                command: 'git-wayback.openTimeline',
                title: 'Open Timeline',
                arguments: [activeEditor.document.uri]
            }));
        }
        catch (e) {
            return [];
        }
    }
}
exports.HistoryTreeViewProvider = HistoryTreeViewProvider;
class HistoryItem extends vscode.TreeItem {
    label;
    author;
    date;
    collapsibleState;
    command;
    constructor(label, author, date, collapsibleState, command) {
        super(label, collapsibleState);
        this.label = label;
        this.author = author;
        this.date = date;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.tooltip = `${this.label}\nBy ${this.author} on ${new Date(this.date).toLocaleString()}`;
        this.description = this.author;
        this.iconPath = new vscode.ThemeIcon('git-commit');
    }
}


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	var __webpack_export_target__ = exports;
/******/ 	for(var __webpack_i__ in __webpack_exports__) __webpack_export_target__[__webpack_i__] = __webpack_exports__[__webpack_i__];
/******/ 	if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map