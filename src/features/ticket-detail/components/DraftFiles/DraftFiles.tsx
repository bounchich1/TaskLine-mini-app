import type { Dispatch, SetStateAction } from 'react';

import type { Draft, Upload } from '@/features/ticket-detail/model/draft';
import { api } from '@/shared/api/http';
import { Icon } from '@/shared/ui';

type DraftFilesProps = {
  uploads: Upload[];
  setDraft: Dispatch<SetStateAction<Draft>>;
};

/** Files attached to the draft, with their scan state; removing one also deletes the upload. */
export function DraftFiles({ uploads, setDraft }: DraftFilesProps) {
  const remove = (file: Upload) => {
    void api(`/v1/uploads/${file.id}`, { method: 'DELETE' }).catch(() => undefined);
    setDraft((draft) => ({
      ...draft,
      uploads: draft.uploads.filter((upload) => upload.id !== file.id),
    }));
  };
  return (
    <div className="draft-files">
      {uploads.map((file) => (
        <span key={file.id}>
          <Icon name="clip" size={14} />
          {file.filename}
          <small>{file.status === 'clean' ? 'Готов к отправке' : 'Проверка файла'}</small>
          <button
            type="button"
            aria-label={`Убрать ${file.filename}`}
            onClick={() => {
              remove(file);
            }}
          >
            <Icon name="close" size={12} />
          </button>
        </span>
      ))}
    </div>
  );
}
