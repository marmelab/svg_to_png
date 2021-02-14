.PHONY: build help

YARN ?= $(shell which yarn)
PKG ?= $(if $(YARN),$(YARN),$(shell which npm))

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: package.json ## Install dependencies
	$(PKG) install

test: ## Run all tests
	$(PKG) run test

watch-test: ## Watch all tests
	$(PKG) run watch-test

build: ## Build the project with babel
	$(PKG) run build

pkg: ## Build the binaries with pkg
	$(PKG) run pkg
