# ADR-002 — EditWeave project name

**Status:** Proposed; npm and MCP Registry naming checks incomplete. **Date:** 2026-11-22.

## Context
The historical project name “CollabWord MCP” implied a permanent Word-only scope. The selected working identity is **EditWeave MCP**, with Word Online as the initial adapter and future extension to other document platforms.

## Decision
Use EditWeave in source and the GitHub repository. Preserve all previous CollabWord ZIP archives and Google Drive documents, and explicitly record the prior identity. Do not claim npm or MCP Registry package availability until authoritative checks succeed.

## Evidence
- GitHub repository **verified created**: https://github.com/EdhuMS/editweave-mcp
- Earlier GitHub name searches yielded no exact match.
- npm direct requests failed under network restrictions; package availability unknown.
- MCP Registry search was inconclusive; registry status unknown.
- The third-party library `@rapid42/editdock` exposes a class named EditWeave: potential naming ambiguity.
- No trademark clearance has been performed.

## Consequences
Canonical Drive folder title remains “CollabWord MCP” to preserve traceability until a final documented migration. Previous ZIP remains available without modification.
