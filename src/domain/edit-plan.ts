export type EditPlan = Readonly<{
  status: 'preview_only';
  scope: 'exact_text';
  target: string;
  proposedReplacement: string;
  expectedOccurrences: 1;
  execution: 'not_implemented';
  warnings: readonly string[];
}>;

export function buildEditPlan(target: string, replacement: string): EditPlan {
  if (typeof target !== 'string' || typeof replacement !== 'string') {
    throw new Error('Text parameters are required.');
  }
  if (!target.trim() || target.length > 5000 || replacement.length > 5000 || target === replacement) {
    throw new Error('Target must be nonempty, texts must be <= 5000 chars and replacement must differ.');
  }
  return {
    status: 'preview_only', scope: 'exact_text', target,
    proposedReplacement: replacement, expectedOccurrences: 1,
    execution: 'not_implemented',
    warnings: [
      'This plan DOES NOT open or edit Microsoft Word.',
      'Before execution: confirm edit permission, exactly one occurrence, revision and explicit human approval.',
      'Do not overwrite the document if a collaborator changed the target.'
    ],
  };
}
