import type { Dispatch, SetStateAction } from 'react';

import type { Draft, Upload } from '@/features/ticket-detail/model/draft';
import { api } from '@/shared/api/http';
import { Icon } from '@/shared/ui';

import './DraftFiles.scss';

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
        <span className="draft-files__item" key={file.id}>
          <Icon name="clip" size={14} />
          <span className="draft-files__name">{file.filename}</span>
          <small className="draft-files__status">
            {file.status === 'clean' ? 'готов' : 'проверяется…'}
          </small>
          <button
            className="draft-files__remove"
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
