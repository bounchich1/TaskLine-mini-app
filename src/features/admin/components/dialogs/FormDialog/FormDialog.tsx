import { Button } from '@maxhub/max-ui';
import type { ReactNode } from 'react';

import { ErrorNotice, Modal } from '@/shared/ui';

type FormDialogProps = {
  title: string;
  formId: string;
  busy: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (form: FormData) => void;
  children: ReactNode;
};

export function FormDialog(props: FormDialogProps) {
  const { title, formId, busy, error, onClose, onSubmit, children } = props;
  return (
    <Modal
      title={title}
      onClose={onClose}
      busy={busy}
      footer={
        <Button form={formId} type="submit" size="small" loading={busy}>
          Сохранить
        </Button>
      }
    >
      <ErrorNotice error={error} />
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(new FormData(event.currentTarget));
        }}
      >
        {children}
      </form>
    </Modal>
  );
}
