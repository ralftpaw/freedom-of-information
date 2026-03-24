# Contributing to Freedom of Information

## Contribution areas

This project needs work across multiple domains:

**Technical infrastructure:**
- Relay architectures for intermittent connectivity
- Protocol design and analysis
- Network analysis and simulation

**Research:**
- How national-scale censorship/firewall systems work technically
- Anti-censorship protocol failure modes
- Network resilience under adversarial conditions

**Documentation:**
- Technical analysis and findings
- How-to guides for contributors
- Case study writeups

## Language guidance

Use the right tool for the task:

| Task type | Language |
|-----------|----------|
| CLI tools, coordination frameworks, API clients | TypeScript |
| Data analysis, network research, security scanning, simulations | Python |

If you're unsure, open an issue first and we'll discuss.

## Contribution process

1. **Check existing issues** before starting — avoid duplicating work.
2. **For research or analysis:** open an issue describing what you're investigating before investing significant time.
3. **For code:** small, focused PRs preferred. Include tests and clear scope.
4. **For sensitive findings:** see `SECURITY.md` for responsible disclosure process.

## Acceptance criteria

All contributions should:
- Have clear scope and rationale
- Include or reference tests where applicable
- Be documented (new behavior = new docs)
- Not increase operational risk for users in restricted regions

## What we reject

- Vague refactors or "drive-by" changes
- Generated bulk edits without validation
- Content that creates legal or safety risk
- Changes that contradict the mission

## Code of conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## Questions

Open an issue with the `question` label or start a discussion.
