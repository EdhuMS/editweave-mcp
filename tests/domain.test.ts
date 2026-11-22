import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyShareLink } from '../src/domain/share-link.ts';
import { buildEditPlan } from '../src/domain/edit-plan.ts';

test('recognizes Microsoft hosts but does not imply edit permission', () => {
  for (const url of [
    'https://1drv.ms/w/s!sample',
    'https://onedrive.live.com/edit.aspx?resid=sample',
    'https://school.sharepoint.com/:w:/r/sites/sample',
    'https://word.cloud.microsoft/'
  ]) {
    const result = classifyShareLink(url);
    assert.equal(result.provider, 'microsoft-word-online');
    assert.equal(result.requiresPermissionCheck, true);
    assert.equal(Object.hasOwn(result, 'url'), false);
  }
});
test('rejects unsafe, lookalike and non-HTTPS URLs', () => {
  for (const url of [
    'http://1drv.ms/unsafe', 'https://1drv.ms.evil.com/doc',
    'https://evilsharepoint.com/doc', 'https://username:password@1drv.ms/doc',
    'https://127.0.0.1/file', 'https://1drv.ms:8443/file',
    'file:///etc/passwd', ' https://1drv.ms/doc',
    'https://onedrive.live.com.evil.example/', 'https://sharepoint.com.evil.example/'
  ]) assert.throws(() => classifyShareLink(url), Error);
});
test('edit plan is scoped and never executes a change', () => {
  const plan = buildEditPlan('Before', 'After');
  assert.equal(plan.scope, 'exact_text');
  assert.equal(plan.execution, 'not_implemented');
  assert.equal(plan.expectedOccurrences, 1);
});
test('rejects empty, equal and whitespace-only targets', () => {
  for (const [a,b] of [['','new'],['same','same'],['   ','new']]) {
    assert.throws(() => buildEditPlan(a,b));
  }
});
