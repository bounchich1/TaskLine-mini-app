import { Button } from '@maxhub/max-ui';
import { clsx } from 'clsx';
import { useEffect, useId, useRef, type ReactNode } from 'react';

import { Icon } from '../Icon/Icon';

import './Modal.scss';

type ModalProps = {
    title: string;
    children: ReactNode;
    onClose: () => void;
    footer?: ReactNode;
    busy?: boolean;
    cancelLabel?: string;
    wide?: boolean;
};

export function Modal(props: ModalProps) {
    const { title, children, onClose, footer, busy = false, cancelLabel = 'Отмена', wide = false } = props;
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();

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
            className={clsx('modal', wide && 'modal--wide')}
            onCancel={(event) => {
                event.preventDefault();

                if (!busy) {
                    onClose();
                }
            }}
            aria-labelledby={titleId}
        >
            <div className="modal__header">
                <h2 className="modal__title" id={titleId}>
                    {title}
                </h2>

                <button className="modal__close" aria-label="Закрыть окно" disabled={busy} onClick={onClose}>
                    <Icon name="close" size={18} />
                </button>
            </div>

            <div className="modal__body">{children}</div>

            <div className="modal__footer">
                <Button variant="secondary" size="small" disabled={busy} onClick={onClose}>
                    {cancelLabel}
                </Button>

                {footer}
            </div>
        </dialog>
    );
}
