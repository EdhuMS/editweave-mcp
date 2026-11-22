# Install EditWeave MCP in OpenCode (Windows 11)

> **Experimental v0.1.0-alpha.0.** This server **cannot read or edit Microsoft Word yet**. It can classify supported Microsoft document URLs and create non-executing exact-text edit plans.

## Requirements
- Git
- Node.js **22.10 or newer** (tested using Node 22 in GitHub Actions)
- OpenCode **v2** CLI already installed and an AI model configured

Verify in PowerShell:

```powershell
git --version
node --version
npm --version
opencode --version
```

## Quick install (project-only, recommended for first smoke test)

```powershell
cd $HOME
git clone https://github.com/EdhuMS/editweave-mcp.git
cd editweave-mcp
npm install
npm test
opencode mcp list
opencode
```

The repository includes `opencode.json`. OpenCode **v2** discovers it when launched in this directory; it configures `mcp.servers.editweave` using stdio and executes `node --experimental-strip-types src/mcp/server.ts`.

If `opencode mcp list` shows `editweave` as connected, try:

> Use EditWeave's `inspect_share_link` to classify `https://1drv.ms/w/s!example`. Report whether permissions were actually verified.

> Use EditWeave's `preview_exact_text_edit` to plan replacing `Introducción preliminar` with `Introducción revisada`. Do not modify any file.

Expect a link classification with permissions **not_checked**, and a preview with `execution: not_implemented`. These are the only current tools.

## Install in OpenCode globally (optional)

Once the project test works, register the same local server from any directory using OpenCode v2's supported CLI, with an absolute source path:

```powershell
$entry = (Resolve-Path .\src\mcp\server.ts).Path
opencode mcp add editweave --global -- node --experimental-strip-types $entry
opencode mcp list
```

Run the first two lines **from the cloned EditWeave directory**. This does not need an npm publication or remote hosting. OpenCode creates or updates its own global configuration. If you already registered `editweave`, inspect `opencode mcp list` first rather than adding duplicates.

### Manual global config alternative

If your OpenCode CLI does not accept `mcp add --global`, manually add this entry under `mcp.servers` in your global `opencode.json(c)`, preserving your existing settings:

```json
{
  "mcp": {
    "servers": {
      "editweave": {
        "type": "local",
        "command": ["node", "--experimental-strip-types", "C:\\Users\\YOUR_USER\\editweave-mcp\\src\\mcp\\server.ts"],
        "codemode": false
      }
    }
  }
}
```

Replace `YOUR_USER` with your actual username; JSON strings require double backslashes.

## Troubleshooting

- `npm` / `node` not found: install current Node.js 22+ and reopen PowerShell.
- `opencode` not found: install OpenCode from https://opencode.ai/docs and reopen terminal.
- `editweave disconnected`: run `npm install` again in repository folder; verify `node --version` and that `src/mcp/server.ts` exists.
- `Unknown option --global`: use manual config or update OpenCode.
- MCP server appears but no Word changes: **expected**; real editing has not been implemented.
- `node src/mcp/server.ts` keeps waiting silently: **expected** for a stdio MCP process. Use OpenCode to perform the protocol handshake; stop manual process with Ctrl+C.
- If you use OpenCode v1, its schema differs (`mcp.editweave` rather than `mcp.servers.editweave`); this guide targets OpenCode v2.

## Security

Shared edit links may carry secret access tokens. Do not paste actual school documents or links in public GitHub issues or command logs. Until the Word adapter is verified, tests should use fictitious document content.

## Official documentation

https://opencode.ai/docs/mcp-servers
