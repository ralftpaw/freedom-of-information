# Decision: Initial Language and Stack

**Date:** 2026-03-24

## Decision

Use TypeScript + Node.js as the primary stack for tooling and infrastructure code.

## Rationale

- Strong typing helps catch errors early in complex coordination logic
- TypeScript is well-supported by GitHub Copilot and agent code tools
- Node.js provides broad compatibility for cross-platform tooling
- `tsx` enables fast iteration without a build step for dev scripts

## Language by task type

| Task | Language |
|------|----------|
| CLI tools, coordination frameworks, API clients | TypeScript |
| Data analysis, network research, security scanning | Python |

Python projects that emerge from this repo should live in a `python/` subdirectory with their own `pyproject.toml`.

## Alternatives considered

- Python-first: rejected for the primary stack because type safety matters more for coordination infrastructure than for research scripts.
- Go: viable but TypeScript has better agent/LLM tooling support currently.

## Status

Accepted.
