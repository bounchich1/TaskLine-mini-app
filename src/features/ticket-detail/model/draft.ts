/** A file attached to the draft; sendable once the server's scan marks it `clean`. */
export type Upload = { id: string; filename: string; status: string };

/** An unsent reply. Drafts outlive the card: they are kept per ticket until the window closes. */
export type Draft = { text: string; uploads: Upload[] };

export const emptyDraft = (): Draft => ({ text: '', uploads: [] });

export const isDraftDirty = (draft: Draft, uploading: boolean) =>
  draft.text.length > 0 || draft.uploads.length > 0 || uploading;

/**
 * Whether the draft can go out now: it has text or files, every file passed the scan, and
 * nothing (an upload, a command) is in flight.
 */
export const canSubmitDraft = (draft: Draft, busy: boolean) =>
  !busy &&
  (draft.text.trim().length > 0 || draft.uploads.length > 0) &&
  draft.uploads.every((upload) => upload.status === 'clean');

/** Appends a paragraph (e.g. the assistant's suggestion) to the draft text, within the limit. */
export const appendToDraft = (text: string, limit: number) => (draft: Draft) => ({
  ...draft,
  text: [draft.text, text].filter(Boolean).join('\n\n').slice(0, limit),
});

/** The body of the `messages` command that sends the draft. */
export const draftMessage = (draft: Draft) => ({
  text: draft.text,
  attachment_ids: draft.uploads.map((upload) => upload.id),
});
