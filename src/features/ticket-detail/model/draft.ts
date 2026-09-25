export type Upload = { id: string; filename: string; status: string };

export type Draft = { text: string; uploads: Upload[] };

export const emptyDraft = (): Draft => ({ text: '', uploads: [] });

export const isDraftDirty = (draft: Draft, uploading: boolean) =>
  draft.text.length > 0 || draft.uploads.length > 0 || uploading;

export const canSubmitDraft = (draft: Draft, busy: boolean) =>
  !busy &&
  (draft.text.trim().length > 0 || draft.uploads.length > 0) &&
  draft.uploads.every((upload) => upload.status === 'clean');

export const appendToDraft = (text: string, limit: number) => (draft: Draft) => ({
  ...draft,
  text: [draft.text, text].filter(Boolean).join('\n\n').slice(0, limit),
});

export const draftMessage = (draft: Draft) => ({
  text: draft.text,
  attachment_ids: draft.uploads.map((upload) => upload.id),
});
