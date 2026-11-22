import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

test('MCP stdio client connects, lists tools, and calls both safely', { timeout: 20000 }, async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['--experimental-strip-types', 'src/mcp/server.ts'],
    cwd: process.cwd(),
    stderr: 'pipe'
  });
  const client = new Client({ name: 'editweave-smoke-test', version: '0.1.0' });
  try {
    await client.connect(transport);
    const listed = await client.listTools();
    assert.deepEqual(listed.tools.map(x => x.name).sort(), ['inspect_share_link', 'preview_exact_text_edit']);

    const inspected = await client.callTool({
      name: 'inspect_share_link',
      arguments: { url: 'https://1drv.ms/w/s!fake-test-link' }
    });
    assert.equal(inspected.isError, undefined);
    const info = JSON.parse((inspected.content as Array<{ type: string; text: string }>)[0].text);
    assert.equal(info.provider, 'microsoft-word-online');
    assert.equal(info.editPermission, 'not_checked');
    assert.equal(JSON.stringify(info).includes('fake-test-link'), false);

    const preview = await client.callTool({
      name: 'preview_exact_text_edit',
      arguments: { target: 'Old heading', replacement: 'New heading' }
    });
    const plan = JSON.parse((preview.content as Array<{ type: string; text: string }>)[0].text);
    assert.equal(plan.execution, 'not_implemented');
    assert.equal(plan.status, 'preview_only');
  } finally {
    await client.close();
  }
});
