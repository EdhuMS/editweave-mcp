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

This calls Playwright headless Chromium and produces a redacted JSON diagnostic: frame **hostnames only**, frame counts, DOM text lengths, control indicators and sanitized failure codes. **No Word document body or sharing-link tokens are returned.** Send status, finalHost, pageTitle, editIndicators, accessibleEditableElements, frames, failureCode, and frameCount to the developer.

If the headless run reports only an empty shell, try **visible Chromium** in an attended Windows session:

```powershell
$env:EDITWEAVE_PROBE_HEADED = "1"
$env:EDITWEAVE_TEST_URL = Read-Host "Pega el enlace de prueba de Word Online"
npm run probe:word
Remove-Item Env:EDITWEAVE_PROBE_HEADED -ErrorAction SilentlyContinue
Remove-Item Env:EDITWEAVE_TEST_URL -ErrorAction SilentlyContinue
```

The launched Chromium window is **not** your normal Edge or Chrome profile; it has no existing Microsoft session. Do not type credentials into the automated browser. No screenshots or browser storage are persisted. A title-only page remains an inconclusive result even if your normal browser can edit the document.

## Stage 2 (not built)
After reviewing stage-1 evidence, design and test a guarded, localized edit. Requirements:
- precisely specified exact target text and expected replacement,
- verification of exactly one matching editable target,
- explicit confirmation and a pre-write version check,
- no bulk-document replacement or edits outside the selected range,
- independent readback that the change persisted,
- abort if two collaborators diverge.

Do not use arbitrary keyboard macros against a production document without independent evidence of target selection.

## Observed from real anonymous test (2026-11-22)

The owner ran the improved probe from Windows and reported the following **read-only evidence**:
- Main SharePoint frame had 0 body text and 0 editable elements.
- Child frame at an `officeapps.live.com` host had 1,028 visible UI characters and 23 `contenteditable` elements.
- UI keywords: `Editing` and `Ribbon`.
- The previous `login_required` result was ambiguous, because the implementation treated *any* text saying `Sign in` as an authentication barrier even if the Word editor frame was present. The classifier now prefers populated editor-frame evidence and also exposes `loginTextDetected` as a separate boolean. This is not a verified absence of authentication for all operations.

**Next mandatory gate before writing:** identify whether the actual document body and the *specific* intended section are available to Playwright; verify exact matching and a safe selection mechanism. A generic `contenteditable` count must never be used to infer that a target paragraph is selectable or writable. Keep the editor on the test fixture only. No write tool exists at this stage.
