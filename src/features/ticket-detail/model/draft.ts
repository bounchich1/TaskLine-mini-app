export type Upload = { id: string; filename: string; status: string };

export type DraftMode = 'reply' | 'note';

export type Draft = {
    text: string;
    uploads: Upload[];
    mode: DraftMode;
    origin: 'ai' | 'macro' | null;
    macroId: string | null;
    mentions: string[];
};

export const emptyDraft = (mode: DraftMode = 'reply'): Draft => ({
    text: '',
    uploads: [],
    mode,
    origin: null,
    macroId: null,
    mentions: [],
});

export const isDraftDirty = (draft: Draft, uploading: boolean) =>
    draft.text.length > 0 || draft.uploads.length > 0 || uploading;

export const canSubmitDraft = (draft: Draft, busy: boolean) => {
    if (busy) {
        return false;
    }

    if (draft.mode === 'note') {
        return draft.text.trim().length > 0;
    }

    return (
        (draft.text.trim().length > 0 || draft.uploads.length > 0) &&
        draft.uploads.every((upload) => upload.status === 'clean')
    );
};

export const withText = (text: string) => (draft: Draft) =>
    text ? { ...draft, text } : { ...draft, text, origin: null, macroId: null, mentions: [] };

export const appendToDraft = (text: string, limit: number) => (draft: Draft) => ({
    ...draft,
    mode: 'reply' as const,
    origin: draft.origin ?? ('ai' as const),
    text: [draft.mode === 'reply' ? draft.text : '', text].filter(Boolean).join('\n\n').slice(0, limit),
});

export const draftMessage = (draft: Draft) => ({
    text: draft.text,
    attachment_ids: draft.uploads.map((upload) => upload.id),
    ...(draft.origin === 'ai' ? { draft_origin: 'ai' } : {}),
    ...(draft.origin === 'macro' && draft.macroId ? { macro_id: draft.macroId } : {}),
});

export const noteMessage = (draft: Draft) => ({
    text: draft.text.trim(),
    mention_ids: draft.mentions,
});
