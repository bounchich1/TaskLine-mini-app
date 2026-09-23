import { Button } from '@maxhub/max-ui';
import { useEffect, useRef, type ReactNode } from 'react';

import { Icon } from '../Icon/Icon';

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  /** Extra footer actions, after "Отмена". */
  footer?: ReactNode;
  /** While busy the dialog cannot be dismissed. */
  busy?: boolean;
};

/** A modal `<dialog>`; focus returns to the previously focused element on close. */
export function Modal({ title, children, onClose, footer, busy = false }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="dialog"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) {
          onClose();
        }
      }}
      aria-labelledby="dialog-title"
    >
      <div className="dialog-head">
        <h2 id="dialog-title">{title}</h2>
        <button className="icon-button" aria-label="Закрыть окно" disabled={busy} onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>
      <div className="dialog-body">{children}</div>
      <div className="dialog-footer">
        <Button variant="secondary" disabled={busy} onClick={onClose}>
          Отмена
        </Button>
        {footer}
      </div>
    </dialog>
  );
}
