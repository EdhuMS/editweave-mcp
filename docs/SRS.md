# Software Requirements Specification — v0.1-alpha

**Status:** Draft. **Goal:** MCP-enabled AI-assisted editing of sections in shared Word Online documents.

## Functional requirements
- **RF-001:** Classify HTTPS sharing URLs from Microsoft host allowlist.
- **RF-002:** Never treat URL recognition as document access or edit authorization.
- **RF-003:** Provide narrow, non-executing exact-text edit plans.
- **RF-004 (future):** Confirm actual edit permission prior to writes.
- **RF-005 (future):** Request explicit per-change approval.
- **RF-006 (future):** Detect conflicting collaborator changes; refuse unsafe writes.
- **RF-007 (future):** Verify saved text without replacing other collaborators' content.
- **RF-008:** Do not log or persist complete sharing links.

## Non-functional requirements
- TypeScript, independent core and adapter modules, MCP stdio transport.
- Unit tests for hostile URLs, edit scope and fail-closed behaviour.
- No CAPTCHA, platform restriction or authorization bypass.

## Acceptance criteria
- `1drv.ms` classified with `editPermission = not_checked`.
- HTTP, lookalike domains and embedded credentials rejected.
- Edit preview outputs `execution = not_implemented`.
- This release exposes no document write tool.
- Word integration cannot be marked complete before live synthetic-document tests.
