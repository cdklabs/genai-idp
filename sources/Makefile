# Makefile for code quality and formatting

# Define color codes
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m  # No Color

# Default target - run both lint and test
all: lint test

# Run tests in idp_common_pkg and idp_cli directories
test:
	$(MAKE) -C lib/idp_common_pkg test
	cd idp_cli && python -m pytest -v

# Run both linting and formatting in one command
lint: ruff-lint format check-arn-partitions validate-buildspec ui-lint
fastlint: ruff-lint format check-arn-partitions validate-buildspec

# Run linting checks and fix issues automatically
ruff-lint:
	ruff check --fix

# Format code according to project standards
format:
	ruff format

# CI/CD version of lint that only checks but doesn't modify files
# Used in CI pipelines to verify code quality without making changes
lint-cicd:
	@echo "Running code quality checks..."
	@if ! ruff check; then \
		echo -e "$(RED)ERROR: Ruff linting failed!$(NC)"; \
		echo -e "$(YELLOW)Please run 'make ruff-lint' locally to fix these issues.$(NC)"; \
		exit 1; \
	fi
	@if ! ruff format --check; then \
		echo -e "$(RED)ERROR: Code formatting check failed!$(NC)"; \
		echo -e "$(YELLOW)Please run 'make format' locally to fix these issues.$(NC)"; \
		exit 1; \
	fi; \
	echo "All checks passed!"
	@echo "Frontend checks"
	@if ! make ui-lint; then \
		echo -e "$(RED)ERROR: UI lint failed$(NC)"; \
		exit 1; \
	fi

	@if ! make ui-build; then \
		echo -e "$(RED)ERROR: UI build failed$(NC)"; \
		exit 1; \
	fi
	
	@echo -e "$(GREEN)All code quality checks passed!$(NC)"

# Validate AWS CodeBuild buildspec files
validate-buildspec:
	@echo "Validating buildspec files..."
	@python3 scripts/validate_buildspec.py patterns/*/buildspec.yml || \
		(echo -e "$(RED)ERROR: Buildspec validation failed!$(NC)" && exit 1)
	@echo -e "$(GREEN)✅ All buildspec files are valid!$(NC)"

# Check CloudFormation templates for hardcoded AWS partition ARNs and service principals
check-arn-partitions:
	@echo "Checking CloudFormation templates for hardcoded ARN partitions and service principals..."
	@FOUND_ISSUES=0; \
	for template in template.yaml patterns/*/template.yaml patterns/*/sagemaker_classifier_endpoint.yaml options/*/template.yaml; do \
		if [ -f "$$template" ]; then \
			echo "Checking $$template..."; \
			ARN_MATCHES=$$(grep -n "arn:aws:" "$$template" | grep -v "arn:\$${AWS::Partition}:" || true); \
			if [ -n "$$ARN_MATCHES" ]; then \
				echo -e "$(RED)ERROR: Found hardcoded 'arn:aws:' references in $$template:$(NC)"; \
				echo "$$ARN_MATCHES" | sed 's/^/  /'; \
				echo -e "$(YELLOW)  These should use 'arn:\$${AWS::Partition}:' instead for GovCloud compatibility$(NC)"; \
				FOUND_ISSUES=1; \
			fi; \
			SERVICE_MATCHES=$$(grep -n "\.amazonaws\.com" "$$template" | grep -v "\$${AWS::URLSuffix}" | grep -v "^[[:space:]]*#" | grep -v "Description:" | grep -v "Comment:" | grep -v "cognito" | grep -v "ContentSecurityPolicy" || true); \
			if [ -n "$$SERVICE_MATCHES" ]; then \
				echo -e "$(RED)ERROR: Found hardcoded service principal references in $$template:$(NC)"; \
				echo "$$SERVICE_MATCHES" | sed 's/^/  /'; \
				echo -e "$(YELLOW)  These should use '\$${AWS::URLSuffix}' instead of 'amazonaws.com' for GovCloud compatibility$(NC)"; \
				echo -e "$(YELLOW)  Example: 'lambda.amazonaws.com' should be 'lambda.\$${AWS::URLSuffix}'$(NC)"; \
				FOUND_ISSUES=1; \
			fi; \
		fi; \
	done; \
	if [ $$FOUND_ISSUES -eq 0 ]; then \
		echo -e "$(GREEN)✅ No hardcoded ARN partition or service principal references found!$(NC)"; \
	else \
		echo -e "$(RED)❌ Found hardcoded references that need to be fixed for GovCloud compatibility$(NC)"; \
		exit 1; \
	fi

# Type checking with basedpyright
typecheck:
	@echo "Running type checks..."
	basedpyright

# Type check with detailed statistics
typecheck-stats:
	@echo "Running type checks with statistics..."
	basedpyright --stats

# Type check only files changed in current PR/branch
# Usage: make typecheck-pr [TARGET_BRANCH=branch_name]
TARGET_BRANCH ?= main
typecheck-pr:
	@echo "Type checking changed files against $(TARGET_BRANCH)..."
	python3 scripts/typecheck_pr_changes.py $(TARGET_BRANCH)


ui-lint:
	@echo "Checking if UI lint is needed..."
	@CURRENT_HASH=$$(python3 -c "from publish import IDPPublisher; p = IDPPublisher(); print(p.get_directory_checksum('src/ui'))"); \
	STORED_HASH=$$(test -f src/ui/.checksum && cat src/ui/.checksum || echo ""); \
	if [ "$$CURRENT_HASH" != "$$STORED_HASH" ]; then \
		echo "UI code checksum changed - running lint..."; \
		cd src/ui && npm ci --prefer-offline --no-audit && npm run lint && \
		echo "$$CURRENT_HASH" > .checksum; \
		echo -e "$(GREEN)✅ UI lint completed and checksum updated$(NC)"; \
	else \
		echo -e "$(GREEN)✅ UI code checksum unchanged - skipping lint$(NC)"; \
	fi

ui-build:
	@echo "Checking UI build"
	cd src/ui && npm ci --prefer-offline --no-audit && npm run build

commit: lint test
	$(info Generating commit message...)
	export COMMIT_MESSAGE="$(shell kiro-cli chat --no-interactive --trust-all-tools "Understand pending local git change and changes to be committed, then infer a commit message. Return this commit message only on a single line." | grep ">" | tail -n 1 | sed 's/\x1b\[[0-9;]*m//g')" && \
	git add . && \
	git commit -am "$${COMMIT_MESSAGE}" && \
	git push

fastcommit: fastlint
	$(info Generating commit message...)
	export COMMIT_MESSAGE="$(shell kiro-cli chat --no-interactive --trust-all-tools "Understand pending local git change and changes to be committed, then infer a commit message. Return this commit message only on a single line." | grep ">" | tail -n 1 | sed 's/\x1b\[[0-9;]*m//g')" && \
	git add . && \
	git commit -am "$${COMMIT_MESSAGE}" && \
	git push
