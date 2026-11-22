# EditWeave MCP — verifiable handoff

Prepared: **2026-11-22** | Profile: **Professional** | Phase: **v0.1.0-alpha**.

## Repository and identity
- Public repository: https://github.com/EdhuMS/editweave-mcp
- Branch: `main`
- Scaffold commit: `1fec21c6cd3014f2b1a2d4e9eaf02e7c71a8fd73`
- Code provenance: earlier candidate ZIP preserved in Google Drive.
- Historical name: **CollabWord MCP**; see ADR-002. Original ZIP must not be deleted or overwritten.
- Canonical project docs: https://drive.google.com/drive/folders/1tB_EMnTojMeI5iOdbzOLeBCDtXaj6-Ch

## Verified facts
- TypeScript MCP stdio entrypoint, URL classifier, non-executing edit planner, four domain tests and CI workflow are committed.
- Earlier local `npm test` passed 4/4 with Node 22.16.0 Linux; this is not proof of remote CI or MCP runtime.
- The repository is public and the license is MIT.
- No document-writing capability has been implemented.

## Tests and deployment
- Local pure-domain tests: passed (prior candidate, 4/4).
- GitHub CI: **passed** on main, run https://github.com/EdhuMS/editweave-mcp/actions/runs/45053027708 (Node 22, domain tests and check); this does not validate actual Word editing.
- Full MCP server runtime: not_run, dependencies could not be installed locally.
- Word Online guest edit, concurrent editing and Graph OAuth: not_run.
- npm publication, MCP Registry, hosting: not deployed.

## Risks and constraints
- Sharing URLs may grant access and must be treated as credentials.
- URL host classification does not imply permission to view or edit.
- Any future writes require scoped plan, explicit human consent, preconditions, conflict detection and independent confirmation.
- Never bypass sign-in, CAPTCHA or platform restrictions.
- npm name availability and MCP Registry name uniqueness remain unverified.

## Next actions
1. Inspect GitHub Actions results for the scaffold and resolve failures.
2. Install dependencies and perform a real MCP stdio client smoke test.
3. Create synthetic Word Online document with edit sharing specifically for PoC.
4. Validate guest edit feasibility; document failure or success with evidence.
5. Update Drive version archive and handoff; consider a release only after full verification.


## OpenCode v2 onboarding — 2026-11-22
- Added project-level `opencode.json` using current OpenCode v2 `mcp.servers.editweave`.
- Installation guide: [docs/INSTALL-OPENCODE.md](../INSTALL-OPENCODE.md).
- An end-to-end **MCP stdio SDK client smoke test** was added in `tests/mcp-smoke.test.ts`, exercising initialize, listTools and both read-only preview tools.
- GitHub Actions **passed** after this change: https://github.com/EdhuMS/editweave-mcp/actions/runs/45054512505. The job ran npm installation, all tests and check on Node 22, Ubuntu.
- Actual OpenCode invocation on the user's Windows machine is not yet verified; user must run `opencode mcp list` and send the outcome.
- Word Online reading/writing is still **not implemented**, with no live document accessed or changed.


## Stage v0.2-alpha — Word Online guest probe (2026-11-22)
- Isolated branch: `feat/word-online-guest-probe`, commit `45a21cf7225eb3598cd6ee11da4f30a1673e77fd`.
- New experimental `probe_word_online` MCP tool and `npm run probe:word` local CLI using Playwright Chromium, no clicks or writes.
- **CI passed**: https://github.com/EdhuMS/editweave-mcp/actions/runs/45055849321, including dependency audit and 7 automated tests.
- Real Microsoft Word guest browser access **not_run**: user must run local probe with synthetic shared test document, redact output and share only status, title, host, indicators and editable count.
- Real document editing **not_implemented**. Never describe URL recognition or UI chrome as verified editable content.
- No Word share URL was written into the repository or Drive; earlier project backups remain intact.
