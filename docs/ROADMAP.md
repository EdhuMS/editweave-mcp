# EditWeave MCP roadmap
- **v0.1-alpha — Foundation:** domain validation, safe edit previews, MCP stdio, documentation and CI. Editing not supported.
- **v0.2-alpha — Word Online PoC:** isolated guest browser, synthetic test document, effective permission verification, scoped edit approval and persisted readback.
- **v0.3-alpha — Collaboration:** detect concurrent edits, protect original content, audit with redaction.
- **v0.4-alpha — Graph OAuth:** Microsoft Graph adapter for explicitly authenticated users.
- **v1.0 — Release:** security review, MCP-client integration tests, bilingual documentation, publication after evidence.

## Risk register
- Critical: unintended overwrite -> guarded edits and human approval.
- High: leaked bearer URLs -> redact sensitive tokens and prevent logging.
- High: changing Office UI -> isolated adapter and integration tests.
- High: organization disallows anonymous editing -> fail without bypass.
- Medium: format fidelity -> bounded edits and visual readback.
- High: unproven interoperability -> never imply functional Word editing before PoC.
