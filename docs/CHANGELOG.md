# Changelog

## Security maintenance — 2026-11-22
- Upgrade `zod` dependency constraint to patched v4 (`^4.6.7`) after Windows user test confirmed `npm audit` 0 vulnerabilities, 5/5 tests passing and MCP connected in OpenCode 1.19.6.
- CI now runs `npm audit --audit-level=high` and fails if vulnerabilities remain.
- **Pending reproducibility:** commit `package-lock.json` generated on the Windows workstation. This runtime could not access npm registry (DNS EAI_AGAIN); lockfile was not invented.

## 0.1.0-alpha.0 — Foundation (2026-11-22)
- Establish the EditWeave repository and initial TypeScript MCP stdio server.
- Expose read-only URL classifier and non-executing exact-text change preview.
- Add domain tests, CI, SRS, ADRs and professional continuity references.
- Archive the earlier CollabWord identity without altering historical backups.

**Not implemented:** Word Online editing, Graph OAuth, npm publication, MCP Registry publication.
