// Part of Composer: styled by Composer.scss.
import type { useAttachmentUpload } from '@/features/ticket-detail/hooks/use-attachment-upload';
import { ACCEPTED_FILES } from '@/features/ticket-detail/model/limits';
import { Icon } from '@/shared/ui';

type AttachButtonProps = {
  uploads: ReturnType<typeof useAttachmentUpload>;
  disabled: boolean;
};

/** Picks a file and uploads it into the draft; shows progress while the server scans it. */
export function AttachButton({ uploads, disabled }: AttachButtonProps) {
  const { uploading, fileRef, upload } = uploads;
  return (
    <>
      <input
        type="file"
        hidden
        ref={fileRef}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void upload(file);
          }
        }}
        accept={ACCEPTED_FILES}
      />
      <button
        type="button"
        className="composer__attach"
        disabled={disabled || uploading}
        onClick={() => fileRef.current?.click()}
      >
        <Icon name="clip" size={18} />
        <span className="composer__attach-label">
          {uploading ? 'Проверяем файл…' : 'Прикрепить файл'}
        </span>
      </button>
    </>
  );
}
