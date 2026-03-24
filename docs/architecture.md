# Architecture

## Overview

This repository contains open-source infrastructure for resilient internet communication under authoritarian control.

## Layers

```
src/
  core/      # Core logic, no external dependencies
  integrations/  # External service adapters (isolated)
  types/     # Shared TypeScript types
  index.ts   # Public API surface
```

## Principles

- **Core is clean:** external dependencies live only in `integrations/`
- **Small surface area:** keep the public API small and explicit
- **Testable:** core logic has no side effects, easy to unit test
- **Documented:** decisions go in `docs/decisions/`

## Research and analysis

Technical research and analysis documents live in `docs/`. ADR-style decision notes go in `docs/decisions/`.

## Contributing

See `CONTRIBUTING.md` for contribution process and language guidance.

## Current status

Early stage — the codebase is bootstrapping. Start with `docs/` and `issues` before writing code.
