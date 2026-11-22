import { chromium } from 'playwright';
import { classifyShareLink } from '../../domain/share-link.ts';

/**
 * Browser-only diagnostic: no keystrokes, no document mutations and no saved
 * browser profile, traces, HARs, screenshots or raw sharing links.
 */
export type WordProbe = {
  status: 'opened' | 'login_required' | 'unknown';
  pageTitle: string;
  finalHost: string;
  editIndicators: string[];
  visibleTextExcerpt: string;
  exposedTextLength: number;
  accessibleEditableElements: number;
  note: string;
};

const microsoftHost = (hostname: string) => {
  const h = hostname.toLowerCase();
  return [
    '1drv.ms', 'office.com', 'www.office.com', 'word.cloud.microsoft',
    'login.microsoftonline.com', 'login.live.com', 'onedrive.live.com'
  ].includes(h) || [
    '.sharepoint.com', '.officeapps.live.com', '.office.com',
    '.microsoft.com', '.microsoftonline.com', '.microsoft365.com',
    '.live.com'
  ].some(s => h.endsWith(s) && h.length > s.length);
};

export async function probeWordOnline(input: string, timeoutMs = 35000): Promise<WordProbe> {
  classifyShareLink(input); // Input must be an approved Microsoft document host.
  const timeout = Math.max(15000, Math.min(timeoutMs, 60000));
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      acceptDownloads: false, serviceWorkers: 'block'
    });
    const page = await context.newPage();
    // Only main-frame navigations are constrained; Word loads many cross-origin
    // assets. Never let a document link redirect the main frame to localhost.
    await page.route('**/*', async route => {
      const req = route.request();
      if (req.isNavigationRequest() && req.frame() === page.mainFrame()) {
        try {
          const next = new URL(req.url());
          if (next.protocol !== 'https:' || !microsoftHost(next.hostname)) {
            await route.abort();
            return;
          }
        } catch { await route.abort(); return; }
      }
      await route.continue();
    });
    await page.goto(input, { waitUntil: 'domcontentloaded', timeout });
    // Word Online commonly renders after the initial HTML.
    await page.waitForTimeout(3500);
    const final = new URL(page.url());
    const title = (await page.title().catch(() => '')).slice(0, 160);
    const text = (await page.locator('body').innerText({ timeout: 10000 }).catch(() => '')).slice(0, 25000);
    const lower = (title + ' ' + text.slice(0, 3000)).toLowerCase();
    const login = /sign in|iniciar sesi[oó]n|acceder a su cuenta|enter your password/.test(lower) ||
      ['login.microsoftonline.com', 'login.live.com'].includes(final.hostname.toLowerCase());
    const indicators = [
      /\bedit(?:ing)?\b/i.test(text) ? 'Editing' : null,
      /\beditar\b/i.test(text) ? 'Editar' : null,
      /\bcompartir\b/i.test(text) ? 'Compartir' : null,
      /\bshare\b/i.test(text) ? 'Share' : null
    ].filter((v): v is string => v !== null);
    const editable = await page.locator('[contenteditable="true"]').count().catch(() => 0);
    return {
      status: login ? 'login_required' : text.length ? 'opened' : 'unknown',
      pageTitle: title,
      finalHost: final.hostname,
      editIndicators: indicators,
      visibleTextExcerpt: text.slice(0, 2500),
      exposedTextLength: text.length,
      accessibleEditableElements: editable,
      note: 'Diagnostic only. The presence of Edit buttons or DOM content does not prove edit permission or access to document body. No content was changed.'
    };
  } catch {
    // Do not expose Playwright error details, which may contain the bearer URL.
    return {
      status: 'unknown', pageTitle: '', finalHost: '',
      editIndicators: [], visibleTextExcerpt: '', exposedTextLength: 0,
      accessibleEditableElements: 0,
      note: 'Browser probe could not complete. Check browser installation, access and Microsoft redirects locally. No content was changed.'
    };
  } finally { await browser.close(); }
}
