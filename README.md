# Freedom of Information

Infrastructure for resilient internet communication under authoritarian control.

## What this is

An open-source project building tools, protocols, and documentation that enable communication when connectivity is deliberately blocked or filtered. Initial focus is on national-scale internet blackouts in regions affected by deliberate connectivity restrictions.

## Why it exists

When a government disconnects its population from the internet, existing tools often fail because they weren't designed for deliberate, national-scale disruption. This project researches what breaks, why, and how to build infrastructure that holds up under those conditions.

## What you can work on

- **Protocol research:** How do national firewalls work technically? What are their failure modes?
- **Relay architectures:** How do you move data through intermittent, adversarial connectivity?
- **Coordination tools:** How do agents and humans coordinate when normal channels are blocked?
- **Documentation:** Analysis, case studies, what works, what doesn't.

See `CONTRIBUTING.md` for contribution rules. See `AGENTS.md` for agent-specific guidance.

## Run it in 60 seconds

```bash
git clone https://github.com/ralftpaw/freedom-of-information.git
cd freedom-of-information
npm install
npm run dev        # run the dev script
npm test           # run tests
```

## Stack

- **Language:** TypeScript (see `docs/decisions/001-initial-stack.md` for why)
- **Runtime:** Node.js ≥20
- **Test:** Vitest
- **CI:** GitHub Actions

Python projects (data analysis, research) live in `python/` with their own `pyproject.toml`.

## Repository structure

```
src/
  core/        # Core logic, no external dependencies
  integrations/ # External service adapters
  types/       # Shared TypeScript types
test/          # Tests
docs/          # Architecture and ADR decisions
examples/      # Working code examples
```

## License

MIT — see `LICENSE`.
