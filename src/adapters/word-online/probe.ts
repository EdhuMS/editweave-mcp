import { chromium } from 'playwright';
import { classifyShareLink } from '../../domain/share-link.ts';

/** Read-only browser diagnostic. Never returns a sharing URL, frame URL or body text. */
export type FrameProbe = {
  host: string;
  bodyTextLength: number;
  editableElementCount: number;
  frameKind: 'main' | 'child';
  markerCounts: Record<'introduccion' | 'desarrollo' | 'conclusiones' | 'textoPrueba', number>;
  editableRoles: Record<string, number>;
  renderStructure: {
    canvases: number;
    svgElements: number;
    documentRoles: number;
    textboxRoles: number;
  };
  textContentMarkerCounts: Record<'introduccion' | 'desarrollo' | 'conclusiones' | 'textoPrueba', number>;
  ariaMarkerCounts: Record<'introduccion' | 'desarrollo' | 'conclusiones' | 'textoPrueba', number>;
  accessibilitySnapshotMarkerCounts: Record<'introduccion' | 'desarrollo' | 'conclusiones' | 'textoPrueba', number>;
};
export type WordProbe = {
  status: 'editor_shell_detected' | 'login_required' | 'permission_denied' | 'html_loaded' | 'timeout' | 'unknown';
  pageTitle: string;
  finalHost: string;
  editIndicators: string[];
  exposedTextLength: number;
  accessibleEditableElements: number;
  frames: FrameProbe[];
  frameCount: number;
  loginTextDetected: boolean;
  editorFrameDetected: boolean;
  documentMarkersFound: boolean;
  markerDetectionMethods: string[];
  elapsedMs: number;
  failureCode?: 'navigation_timeout' | 'navigation_failed' | 'browser_launch_failed' | 'unknown_failure';
  note: string;
};

export function microsoftHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return [
    '1drv.ms', 'office.com', 'www.office.com', 'word.cloud.microsoft',
    'login.microsoftonline.com', 'login.live.com', 'onedrive.live.com'
  ].includes(h) || [
    '.sharepoint.com', '.officeapps.live.com', '.office.com',
    '.microsoft.com', '.microsoftonline.com', '.microsoft365.com',
    '.live.com'
  ].some(s => h.endsWith(s) && h.length > s.length);
}

type MarkerCounts = FrameProbe['markerCounts'];

export function countFixtureMarkers(value: string): MarkerCounts {
  const normalized = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const count = (term: string) => normalized.split(term).length - 1;
  return {
    introduccion: count('introduccion'),
    desarrollo: count('desarrollo'),
    conclusiones: count('conclusiones'),
    textoPrueba: count('esto es una prueba')
  };
}

const hasThreeSections = (counts: MarkerCounts): boolean =>
  counts.introduccion > 0 && counts.desarrollo > 0 && counts.conclusiones > 0;

const titleIndicators = (text: string): string[] => {
  const patterns = [
    ['Editing', /\bEditing\b/i],
    ['Edición', /Edici[oó]n/i],
    ['Editar', /\bEditar\b/i],
    ['Compartir', /\bCompartir\b/i],
    ['Share', /\bShare\b/i],
    ['Ribbon', /\b(?:Insert|Insertar|Review|Revisar)\b/i]
  ] as const;
  return patterns.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
};

export async function probeWordOnline(input: string, timeoutMs = 45000): Promise<WordProbe> {
  classifyShareLink(input);
  const timeout = Math.max(15000, Math.min(timeoutMs, 60000));
  const started = Date.now();
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  let pageTitle = '';
  let finalHost = '';
  let failureCode: WordProbe['failureCode'];
  try {
    const headed = process.env.EDITWEAVE_PROBE_HEADED === '1';
    browser = await chromium.launch({ headless: !headed });
    const context = await browser.newContext({ acceptDownloads: false });
    const page = await context.newPage();
    // All main-frame navigation is restricted to HTTPS Microsoft-controlled hosts.
    await page.route('**/*', async route => {
      const request = route.request();
      if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
        try {
          const url = new URL(request.url());
          if (url.protocol !== 'https:' || !microsoftHost(url.hostname)) {
            await route.abort();
            return;
          }
        } catch {
          await route.abort();
          return;
        }
      }
      await route.continue();
    });

    try {
      await page.goto(input, { waitUntil: 'domcontentloaded', timeout });
    } catch (error) {
      const message = error instanceof Error ? error.name : '';
      failureCode = message === 'TimeoutError' ? 'navigation_timeout' : 'navigation_failed';
    }

    // Wait for the editor shell or a stable list of frames, not a hard-coded 3.5s.
    // Avoid networkidle, which can remain blocked indefinitely by collaboration polling.
    const deadline = Date.now() + Math.min(20000, Math.floor(timeout / 2));
    let lastState = '';
    let stableCount = 0;
    while (Date.now() < deadline && !page.isClosed()) {
      const frames = page.frames();
      const state = frames.map(f => {
        try { return new URL(f.url()).hostname; } catch { return ''; }
      }).join('|');
      if (state === lastState && frames.length > 1) stableCount++;
      else stableCount = 0;
      lastState = state;
      const shell = await page.getByRole('button', { name: /(?:Editing|Edici[oó]n|Share|Compartir)/i })
        .first().isVisible().catch(() => false);
      if (shell || stableCount >= 8) break;
      await page.waitForTimeout(1000);
    }

    pageTitle = (await page.title().catch(() => '')).slice(0, 160);
    try { finalHost = new URL(page.url()).hostname; } catch { finalHost = ''; }

    const frameDetails: FrameProbe[] = [];
    let allTextLength = 0;
    let allEditable = 0;
    let indicators: string[] = [];
    let login = ['login.microsoftonline.com', 'login.live.com'].includes(finalHost.toLowerCase());
    let denied = false;
    let editorFrameDetected = false;
    for (const frame of page.frames().slice(0, 40)) {
      let host = '';
      try { host = new URL(frame.url()).hostname; } catch { host = 'internal'; }
      // Never inspect unexpected origins in diagnostic results.
      if (host !== 'internal' && !microsoftHost(host)) continue;
      const text = await frame.locator('body').innerText({ timeout: 2500 }).catch(() => '');
      const editable = await frame.locator('[contenteditable="true"]').count().catch(() => 0);
      // Never return document text, aria labels, or sharing URLs.
      // These fixed fixture markers are only diagnostics, not safe write selectors.
      const markerCounts = countFixtureMarkers(text);
      const structural = await frame.evaluate(() => {
        const body = document.body;
        const empty = { textContent: '', ariaLabels: '', canvases: 0, svgElements: 0,
          documentRoles: 0, textboxRoles: 0 };
        if (!body) return empty;
        // TextContent may include invisible UI strings or application templates.
        const textNodes: string[] = [];
        const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
        let current: Node | null;
        let count = 0;
        while ((current = walker.nextNode()) && count < 10000) {
          const parent = current.parentElement;
          if (!parent || parent.closest('script,style,noscript,template')) continue;
          textNodes.push(current.textContent || '');
          count++;
        }
        const ariaLabels = Array.from(body.querySelectorAll('[aria-label], [title]'))
          .slice(0, 5000)
          .map(el => (el.getAttribute('aria-label') || '') + ' ' + (el.getAttribute('title') || ''))
          .join(' ');
        return {
          textContent: textNodes.join(' ').slice(0, 150000),
          ariaLabels: ariaLabels.slice(0, 150000),
          canvases: body.querySelectorAll('canvas').length,
          svgElements: body.querySelectorAll('svg').length,
          documentRoles: body.querySelectorAll('[role="document"]').length,
          textboxRoles: body.querySelectorAll('[role="textbox"]').length
        };
      }).catch(() => ({
        textContent: '', ariaLabels: '', canvases: 0, svgElements: 0,
        documentRoles: 0, textboxRoles: 0
      }));
      const textContentMarkerCounts = countFixtureMarkers(structural.textContent);
      const ariaMarkerCounts = countFixtureMarkers(structural.ariaLabels);
      // Accessibility snapshots can expose text that is absent from innerText;
      // inspect locally and return only counts of known synthetic phrases.
      const snapshot = await frame.locator('body').ariaSnapshot({ timeout: 3000 }).catch(() => '');
      const accessibilitySnapshotMarkerCounts = countFixtureMarkers(snapshot);
      const editableRoles = await frame.locator('[contenteditable="true"]').evaluateAll(elements => {
        const roles: Record<string, number> = {};
        for (const el of elements) {
          const tag = el.tagName.toLowerCase();
          const role = (el.getAttribute('role') ?? 'none').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32);
          const key = (tag + ':' + role).slice(0, 48);
          roles[key] = (roles[key] || 0) + 1;
        }
        return roles;
      }).catch(() => ({} as Record<string, number>));
      allTextLength += text.length;
      allEditable += editable;
      if (host.endsWith('.officeapps.live.com') && (editable > 0 || /\bEditing\b|Edici[oó]n/i.test(text))) editorFrameDetected = true;
      indicators.push(...titleIndicators(text.slice(0, 10000)));
      if (/sign in|iniciar sesi[oó]n|acceder a su cuenta|enter your password/i.test(text.slice(0, 5000))) login = true;
      if (/access denied|you don't have permission|acceso denegado|no tiene permisos/i.test(text.slice(0, 5000))) denied = true;
      frameDetails.push({
        host,
        bodyTextLength: text.length,
        editableElementCount: editable,
        frameKind: frame === page.mainFrame() ? 'main' : 'child',
        markerCounts,
        editableRoles,
        renderStructure: {
          canvases: structural.canvases, svgElements: structural.svgElements,
          documentRoles: structural.documentRoles, textboxRoles: structural.textboxRoles
        },
        textContentMarkerCounts, ariaMarkerCounts, accessibilitySnapshotMarkerCounts
      });
    }
    indicators = [...new Set(indicators)];
    // A sign-in prompt inside a working editor often refers to an optional
    // account action, not an actual authentication gate. Prefer direct shell
    // evidence over incidental 'Sign in' strings; a login URL remains decisive.
    const loginHost = ['login.microsoftonline.com', 'login.live.com'].includes(finalHost.toLowerCase());

    return {
      status: loginHost ? 'login_required' : editorFrameDetected ? 'editor_shell_detected'
        : denied ? 'permission_denied' : login ? 'login_required'
        : indicators.some(x => ['Editing','Edición','Editar'].includes(x)) ? 'editor_shell_detected'
        : allTextLength > 0 || pageTitle ? 'html_loaded'
        : failureCode === 'navigation_timeout' ? 'timeout' : 'unknown',
      pageTitle, finalHost, editIndicators: indicators,
      exposedTextLength: allTextLength,
      accessibleEditableElements: allEditable,
      frames: frameDetails, frameCount: page.frames().length,
      loginTextDetected: login, editorFrameDetected,
      documentMarkersFound: frameDetails.some(f =>
        [f.markerCounts, f.textContentMarkerCounts, f.ariaMarkerCounts,
          f.accessibilitySnapshotMarkerCounts].some(hasThreeSections)),
      markerDetectionMethods: [
        ...(frameDetails.some(f => hasThreeSections(f.markerCounts)) ? ['innerText'] : []),
        ...(frameDetails.some(f => hasThreeSections(f.textContentMarkerCounts)) ? ['textNodes'] : []),
        ...(frameDetails.some(f => hasThreeSections(f.ariaMarkerCounts)) ? ['ariaLabels'] : []),
        ...(frameDetails.some(f => hasThreeSections(f.accessibilitySnapshotMarkerCounts)) ? ['accessibilitySnapshot'] : [])
      ],
      elapsedMs: Date.now() - started,
      ...(failureCode ? { failureCode } : {}),
      note: 'Read-only diagnostic. Editor-shell controls and accessible elements are not proof of write access or document-body access. No document was modified.'
    };
  } catch {
    return {
      status: 'unknown', pageTitle, finalHost, editIndicators: [],
      exposedTextLength: 0, accessibleEditableElements: 0, frames: [], frameCount: 0,
      elapsedMs: Date.now() - started, loginTextDetected: false, editorFrameDetected: false, documentMarkersFound: false, markerDetectionMethods: [],
      failureCode: browser ? 'unknown_failure' : 'browser_launch_failed',
      note: 'Browser diagnostic failed. Check Playwright installation and network. No document was modified.'
    };
  } finally {
    await browser?.close();
  }
}
