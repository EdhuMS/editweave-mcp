# Word Online anonymous-edit link PoC — stage 1 (read only)

**Status: experimental.** The existing Microsoft share link was reported by the owner to be editable in a Windows incognito browser. This is not independent verification of browser automation or document write access.

## Safety
- Only test on a synthetic, owner-authorized document.
- Never commit, log, screenshot or publish the full sharing link; it is a bearer credential.
- Stage 1 intentionally **does not** click, type, or modify anything.
- Browser context is ephemeral and headless, with no persisted cookies or storage state.
- `status: opened` is evidence of loading an interface, NOT permission to edit.
- DOM text may show only application chrome, not the document body (Word often uses canvas).

## Install prerequisites (Windows PowerShell)
From the repository root after pulling the feature branch:

```powershell
npm install
npx playwright install chromium
npm test
```

## Stage 1: real anonymous browser probe

Assign your sharing URL in the current PowerShell session (do not enter it into a public issue or terminal recording):

```powershell
$env:EDITWEAVE_TEST_URL = Read-Host "Pega el enlace de prueba de Word Online"
npm run probe:word
Remove-Item Env:EDITWEAVE_TEST_URL
```

This calls Playwright headless Chromium and produces a JSON diagnostic. Send only the status, finalHost, pageTitle, editIndicators and accessibleEditableElements to the developer. **Do not share the visibleTextExcerpt if the document contains confidential text.**

## Stage 2 (not built)
After reviewing stage-1 evidence, design and test a guarded, localized edit. Requirements:
- precisely specified exact target text and expected replacement,
- verification of exactly one matching editable target,
- explicit confirmation and a pre-write version check,
- no bulk-document replacement or edits outside the selected range,
- independent readback that the change persisted,
- abort if two collaborators diverge.

Do not use arbitrary keyboard macros against a production document without independent evidence of target selection.
