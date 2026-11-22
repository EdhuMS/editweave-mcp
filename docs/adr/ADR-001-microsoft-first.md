# ADR-001 — Microsoft-first, adapter-isolated architecture

**Status:** Proposed pending technical PoC. **Date:** 2026-11-22.

## Context
Users want AI to edit a Word Online file through “Anyone with the link can edit” without owning the file. The browser guest session and authenticated Microsoft Graph API are not interchangeable.

## Decision
Build provider-neutral domain and MCP tools, prototype a Word Online browser adapter with test documents, and later provide Graph OAuth separately. No write tools until scope, permission, approval and conflict handling are verified.

## Rejected or deferred alternatives
Graph-only does not directly solve guest anonymous links. Browser-only creates maintenance and compatibility risk. Split adapters reduce coupling.

## Evidence
https://support.microsoft.com/en-us/word/share-access-to-a-file-with-no-sign-in-necessary
https://learn.microsoft.com/en-us/graph/api/shares-get?view=graph-rest-1.0

## Consequences
Editing, persistence, permission enforcement and formatting remain unverified. Failed access must not trigger attempts to circumvent the platform.
