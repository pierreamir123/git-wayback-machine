.PHONY: help install build dev watch lint clean test package release

# Variables
NODE := node
NPM := npm
VSCODE := code

# Colors for output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(CYAN)Git Wayback Machine - Development Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Quick Start:$(NC)"
	@echo "  make install    # Install all dependencies"
	@echo "  make dev        # Start dev servers"
	@echo "  make build      # Build for production"
	@echo "  make package    # Create VSIX package"

# Installation & Setup
install: ## Install all dependencies
	@echo "$(CYAN)Installing dependencies...$(NC)"
	$(NPM) install
	cd webview && $(NPM) install && cd ..
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

install-ext: ## Install extension dependencies only
	@echo "$(CYAN)Installing extension dependencies...$(NC)"
	$(NPM) install
	@echo "$(GREEN)✓ Extension dependencies installed$(NC)"

install-webview: ## Install webview dependencies only
	@echo "$(CYAN)Installing webview dependencies...$(NC)"
	cd webview && $(NPM) install
	@echo "$(GREEN)✓ Webview dependencies installed$(NC)"

# Development
dev: ## Start development servers (extension + webview)
	@echo "$(CYAN)Starting development servers...$(NC)"
	@echo "$(YELLOW)Extension:$(NC) npm run watch (in background)"
	@echo "$(YELLOW)Webview:$(NC) cd webview && npm run dev"
	@echo ""
	@echo "$(CYAN)Opening VS Code Extension Development Host...$(NC)"
	$(NPM) run watch &
	cd webview && $(NPM) run dev

dev-ext: ## Watch extension code only
	@echo "$(CYAN)Watching extension code...$(NC)"
	$(NPM) run watch

dev-webview: ## Start webview dev server only
	@echo "$(CYAN)Starting webview dev server...$(NC)"
	cd webview && $(NPM) run dev

watch: ## Alias for dev-ext
	$(NPM) run watch

# Building
build: ## Build extension and webview for production
	@echo "$(CYAN)Building for production...$(NC)"
	$(NPM) run build
	@echo "$(GREEN)✓ Build complete$(NC)"

build-ext: ## Build extension only
	@echo "$(CYAN)Building extension...$(NC)"
	$(NPM) run package
	@echo "$(GREEN)✓ Extension built$(NC)"

build-webview: ## Build webview only
	@echo "$(CYAN)Building webview...$(NC)"
	cd webview && $(NPM) run build
	@echo "$(GREEN)✓ Webview built$(NC)"

# Packaging & Distribution
package: build ## Create VSIX package for distribution
	@echo "$(CYAN)Packaging as VSIX...$(NC)"
	$(NPM) run vsix
	@echo "$(GREEN)✓ VSIX package created$(NC)"

install-vsix: package ## Package and install extension locally
	@echo "$(CYAN)Installing VSIX locally...$(NC)"
	$(VSCODE) --install-extension git-wayback-machine-*.vsix
	@echo "$(GREEN)✓ Extension installed$(NC)"

# Testing & Quality
lint: ## Run ESLint
	@echo "$(CYAN)Running linter...$(NC)"
	$(NPM) run lint
	@echo "$(GREEN)✓ Linting complete$(NC)"

test: ## Run tests (if configured)
	@echo "$(YELLOW)Tests not yet configured$(NC)"

# Cleaning
clean: ## Remove build artifacts and dependencies
	@echo "$(CYAN)Cleaning build artifacts...$(NC)"
	rm -rf dist/
	rm -rf webview/dist/
	rm -rf node_modules/
	rm -rf webview/node_modules/
	rm -f *.vsix
	@echo "$(GREEN)✓ Cleaned$(NC)"

clean-build: ## Remove build artifacts only
	@echo "$(CYAN)Removing build artifacts...$(NC)"
	rm -rf dist/
	rm -rf webview/dist/
	rm -f *.vsix
	@echo "$(GREEN)✓ Artifacts removed$(NC)"

clean-deps: ## Remove node_modules only
	@echo "$(CYAN)Removing dependencies...$(NC)"
	rm -rf node_modules/
	rm -rf webview/node_modules/
	@echo "$(GREEN)✓ Dependencies removed$(NC)"

# Git & Release
status: ## Show git status
	git status

log: ## Show recent commits
	git log --oneline -10

tag: ## List version tags
	git tag -l -n1

release: build ## Create a release (build first)
	@echo "$(CYAN)Creating release...$(NC)"
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Commit changes: git add . && git commit -m 'chore: release'"
	@echo "  2. Tag version: git tag -a vX.Y.Z -m 'Release vX.Y.Z'"
	@echo "  3. Push: git push origin main && git push origin vX.Y.Z"
	@echo "  4. Create GitHub release and upload VSIX"

# Info & Documentation
info: ## Show project information
	@echo "$(CYAN)Git Wayback Machine$(NC) - Extension Information"
	@echo ""
	@echo "$(GREEN)Version:$(NC)" $$(grep '"version"' package.json | head -1 | cut -d'"' -f4)
	@echo "$(GREEN)Description:$(NC)" $$(grep '"description"' package.json | head -1 | cut -d'"' -f4)
	@echo "$(GREEN)Repository:$(NC)" $$(grep '"url"' package.json | head -1 | cut -d'"' -f4)
	@echo ""
	@echo "$(GREEN)Components:$(NC)"
	@ls -1 webview/src/components/*/
	@echo ""
	@echo "$(GREEN)VSIX File:$(NC)"
	@ls -lh *.vsix 2>/dev/null || echo "  (Not built yet. Run 'make package')"

docs: ## Show documentation files
	@echo "$(CYAN)Documentation$(NC)"
	@echo "  README.md              - Project overview"
	@echo "  COMPONENTS_GUIDE.md    - Component documentation"
	@echo "  CLAUDE.md              - Development guidelines"
	@echo ""
	@echo "$(YELLOW)View with:$(NC)"
	@echo "  less README.md"
	@echo "  less COMPONENTS_GUIDE.md"

# Development helpers
format: ## Format code (if prettier configured)
	@echo "$(YELLOW)Code formatting not yet configured$(NC)"

security-audit: ## Run npm security audit
	@echo "$(CYAN)Running security audit...$(NC)"
	$(NPM) audit
	@echo "$(GREEN)✓ Audit complete$(NC)"

update-deps: ## Update dependencies
	@echo "$(CYAN)Updating dependencies...$(NC)"
	$(NPM) update
	cd webview && $(NPM) update
	@echo "$(GREEN)✓ Dependencies updated$(NC)"

# Shortcuts
b: build ## Shortcut for build
w: watch ## Shortcut for watch
p: package ## Shortcut for package
c: clean ## Shortcut for clean
i: install ## Shortcut for install

.DEFAULT_GOAL := help
