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
- GitHub CI: **not_run / pending workflow confirmation** as of this handoff snapshot.
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
