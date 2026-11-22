/** MCP stdio adapter: no Word access or write tool is enabled in this release. */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { classifyShareLink } from '../domain/share-link.ts';
import { buildEditPlan } from '../domain/edit-plan.ts';

const server = new McpServer({ name: 'editweave-mcp', version: '0.1.0-alpha.0' });

server.tool('inspect_share_link',
  'Classify a Microsoft sharing link without fetching it or checking actual permissions.',
  { url: z.string().max(4096) }, async ({ url }) => {
    try {
      const info = classifyShareLink(url);
      return { content: [{ type: 'text', text: JSON.stringify({
        ...info, documentAccess: 'not_checked', editPermission: 'not_checked',
        note: 'Never infer edit permission from link syntax.'
      }) }] };
    } catch {
      return { isError: true, content: [{ type: 'text', text: 'Invalid or unsupported Microsoft sharing link.' }] };
    }
  });

server.tool('preview_exact_text_edit',
  'Draft one exact-text replacement; does not edit any document.',
  { target: z.string().max(5000), replacement: z.string().max(5000) },
  async ({ target, replacement }) => {
    try {
      return { content: [{ type: 'text', text: JSON.stringify(buildEditPlan(target, replacement)) }] };
    } catch {
      return { isError: true, content: [{ type: 'text', text: 'Invalid edit plan.' }] };
    }
  });

await server.connect(new StdioServerTransport());
