/**
 * Local, read-only guest probe. Pass the sharing link via an environment variable
 * rather than command-line arguments so it is not written into shell history.
 * Never paste its output into public GitHub issues.
 */
import { probeWordOnline } from '../src/adapters/word-online/probe.ts';
const url = process.env.EDITWEAVE_TEST_URL;
if (!url) {
  process.stderr.write('Set EDITWEAVE_TEST_URL in your current PowerShell session.\n');
  process.exitCode = 2;
} else {
  const result = await probeWordOnline(url);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
