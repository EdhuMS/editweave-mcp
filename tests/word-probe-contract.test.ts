import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { classifyShareLink } from '../src/domain/share-link.ts';

test('Word Online probe is gated behind existing sharing-link allowlist', () => {
  assert.equal(classifyShareLink('https://utpedupe-my.sharepoint.com/:w:/g/example').provider, 'microsoft-word-online');
  assert.throws(() => classifyShareLink('https://127.0.0.1/'));
});

test('experimental probe does not expose any write functions', () => {
  const code = readFileSync(new URL('../src/adapters/word-online/probe.ts', import.meta.url), 'utf8');
  assert.match(code, /probeWordOnline/);
  assert.doesNotMatch(code, /\.fill\(|\.type\(|\.press\(|\.click\(|\.insertText\(/);
});

test('fixture marker counter normalizes accents and measures occurrences', async () => {
  const { countFixtureMarkers } = await import('../src/adapters/word-online/probe.ts');
  const result = countFixtureMarkers('Introducción. Desarrollo. Conclusiones. Esto es una prueba. Esto es una prueba.');
  assert.deepEqual(result, {
    introduccion: 1, desarrollo: 1, conclusiones: 1, textoPrueba: 2
  });
  assert.equal(countFixtureMarkers('Edición Compartir Archivo').desarrollo, 0);
});
