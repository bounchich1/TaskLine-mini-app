import { Button } from '@maxhub/max-ui';
import type { ReactNode } from 'react';

import { formText } from '@/features/incidents/model/form';
import { CheckboxField, ErrorNotice, FormField, Modal } from '@/shared/ui';

import './TextDialog.scss';

type TextDialogProps = {
    title: string;
    label: string;
    hint?: ReactNode;
    submitLabel: string;
    defaultValue?: string;
    required?: boolean;
    option?: { label: string; checked: boolean };
    busy: boolean;
    error: unknown;
    onClose: () => void;
    onSubmit: (text: string, option: boolean) => void;
};

export function TextDialog(props: TextDialogProps) {
    const { title, label, hint, submitLabel, defaultValue = '', required = true, option, busy } = props;

    return (
        <Modal
            title={title}
            onClose={props.onClose}
            busy={busy}
            footer={
                <Button form="incident-text-form" type="submit" size="small" loading={busy}>
                    {submitLabel}
                </Button>
            }
        >
            <ErrorNotice error={props.error} />

            <form
                id="incident-text-form"
                className="text-dialog"
                onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);

                    props.onSubmit(formText(form, 'text'), form.get('option') === 'on');
                }}
            >
                <FormField label={label} hint={hint}>
                    <textarea name="text" rows={4} maxLength={2000} required={required} defaultValue={defaultValue} />
                </FormField>

                {option ? (
                    <CheckboxField name="option" defaultChecked={option.checked}>
                        {option.label}
                    </CheckboxField>
                ) : null}
            </form>
        </Modal>
    );
}
