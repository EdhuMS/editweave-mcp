# EditWeave MCP

> **Experimental v0.1.0-alpha** — open-source Model Context Protocol server for AI-assisted editing of shared cloud documents, starting with Microsoft Word Online.

**Current capability:** validates Microsoft document-link domains and previews narrowly scoped text edits. **It does not open, fetch, or modify Word documents yet.** Editing via anonymous shared links remains an unverified research goal.

## Purpose
A student receives a Microsoft Word Online document with “Anyone with the link can edit” permissions and wants an AI agent to edit only an assigned section, preserving collaborators' work.

## Word Online live diagnostic (experimental)

A new `probe_word_online` tool opens a shared Word Online URL in disposable headless Chromium **without clicking or writing**. Install Chromium using `npx playwright install chromium` after `npm install`. See [Word Online PoC](docs/WORD-ONLINE-POC.md).

**No Word editing capability exists yet.** The diagnostic cannot prove edit permission or locate text reliably until tested with the actual editor.

## Status
- `inspect_share_link`: classifies an allowed Microsoft URL without fetching it or claiming access.
- `preview_exact_text_edit`: returns a non-executing change plan.
- Word Online browser adapter: **not implemented**.
- Microsoft Graph OAuth adapter: **not implemented**.
- No authentication bypass, automatic edits, or guarantees of formatting fidelity.

## OpenCode terminal installation

See [step-by-step Windows/OpenCode v2 guide](docs/INSTALL-OPENCODE.md). A project-level `opencode.json` is included so OpenCode can discover the MCP without npm publication or remote hosting.

## Quick start
Requires Node.js >= 22.10.
```bash
npm install
npm test
npm start
```
Connect a compatible MCP client using the command `npm start` over the **stdio** transport.

## Project structure
```text
src/
  domain/               # pure validation and edit planning
  mcp/                  # protocol entry point
  adapters/word-online/ # browser integration research
  adapters/graph/       # OAuth API research
tests/                  # isolated domain tests
docs/
  adr/                  # architectural decisions
  continuity/           # verified state and handoff
```

## Security
Sharing links can contain sensitive bearer tokens. Never log or publish live document URLs. URL validation alone does **not** establish permission to view or edit. Future write operations must require explicit per-change approval, a scoped diff, conflict detection, and post-edit verification. Do not circumvent Microsoft authentication, CAPTCHA, or access restrictions.

## Architecture and documentation
See [SRS](docs/SRS.md), [Roadmap](docs/ROADMAP.md), [ADR-001](docs/adr/ADR-001-microsoft-first.md), [ADR-002](docs/adr/ADR-002-editweave-brand.md), and [handoff](docs/continuity/HANDOFF.md).

The full professional project dossier and version backups are preserved in [Google Drive](https://drive.google.com/drive/folders/1tB_EMnTojMeI5iOdbzOLeBCDtXaj6-Ch), following [AI Project Documentation Skill](https://github.com/EdhuMS/ai-project-documentation-skill).

## Primary references
- [Word for the web: share access without sign-in](https://support.microsoft.com/en-us/word/share-access-to-a-file-with-no-sign-in-necessary)
- [Microsoft Graph shares API](https://learn.microsoft.com/en-us/graph/api/shares-get?view=graph-rest-1.0)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License
MIT (see [LICENSE](LICENSE)). Not affiliated with Microsoft or OpenAI.