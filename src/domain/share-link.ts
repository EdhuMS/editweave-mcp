/** Only classify links; never dereference an untrusted URL here. */
export type ShareLinkInfo = Readonly<{
  provider: 'microsoft-word-online';
  host: string;
  requiresPermissionCheck: true;
}>;

const exactHosts = new Set([
  '1drv.ms', 'onedrive.live.com', 'word.cloud.microsoft', 'www.office.com', 'office.com'
]);
const allowedSuffixes = ['.sharepoint.com', '.officeapps.live.com'];

export function classifyShareLink(input: string): ShareLinkInfo {
  if (typeof input !== 'string' || input.length > 4096 || input.trim() !== input) {
    throw new Error('Provide one valid Microsoft Word sharing URL.');
  }
  let url: URL;
  try { url = new URL(input); } catch { throw new Error('Invalid sharing URL.'); }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !host ||
      !(exactHosts.has(host) || allowedSuffixes.some(s => host.endsWith(s) && host.length > s.length))) {
    throw new Error('Only HTTPS URLs on supported Microsoft document hosts are accepted.');
  }
  return { provider: 'microsoft-word-online', host, requiresPermissionCheck: true };
}
