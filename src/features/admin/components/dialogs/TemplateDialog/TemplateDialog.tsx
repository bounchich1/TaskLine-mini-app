import { useRef, useState } from 'react';

import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import { useBotSettings } from '@/features/admin/hooks/use-bot-settings';
import { TEMPLATE_INFO, variablesFor } from '@/features/admin/model/template-catalog';
import type { Template } from '@/features/admin/model/types';
import { FormField } from '@/shared/ui';

import { FormDialog } from '../FormDialog/FormDialog';

import { TemplatePreview } from './TemplatePreview';

import './TemplateDialog.scss';

type TemplateDialogProps = {
    template: Template;
    busy: boolean;
    error: unknown;
    save: AdminSave;
    onClose: () => void;
};

const MAX_LENGTH = 3000;

export function TemplateDialog({ template, busy, error, save, onClose }: TemplateDialogProps) {
    const [body, setBody] = useState(template.body);
    const field = useRef<HTMLTextAreaElement>(null);
    const bot = useBotSettings();
    const info = TEMPLATE_INFO[template.code];

    const insert = (name: string) => {
        const input = field.current;
        const start = input?.selectionStart ?? body.length;
        const end = input?.selectionEnd ?? body.length;
        const token = `{${name}}`;

        setBody(body.slice(0, start) + token + body.slice(end));

        requestAnimationFrame(() => {
            input?.focus();
            input?.setSelectionRange(start + token.length, start + token.length);
        });
    };

    return (
        <FormDialog
            title={info?.title ?? 'Сообщение бота'}
            formId="template-form"
            busy={busy}
            error={error}
            wide
            onClose={onClose}
            onSubmit={() => {
                void save(`/v1/admin/templates/${template.code}`, {
                    method: 'PUT',
                    body: { body },
                    version: template.version,
                });
            }}
        >
            <p className="template-editor__when">
                {info ? `${info.when}. ` : null}
                <code>{template.code}</code>
            </p>

            <FormField label="Текст" hint={`${body.length} / ${MAX_LENGTH}`}>
                <textarea
                    ref={field}
                    name="body"
                    rows={6}
                    maxLength={MAX_LENGTH}
                    value={body}
                    required
                    onChange={(event) => {
                        setBody(event.currentTarget.value);
                    }}
                />
            </FormField>

            <div className="template-editor__variables" role="group" aria-label="Вставить подстановку">
                {variablesFor(template.code).map((variable) => (
                    <button
                        key={variable.name}
                        type="button"
                        className="template-editor__chip"
                        onClick={() => {
                            insert(variable.name);
                        }}
                    >
                        {variable.label}
                    </button>
                ))}

                {template.default_body !== null && template.default_body !== body ? (
                    <button
                        type="button"
                        className="template-editor__reset"
                        onClick={() => {
                            setBody(template.default_body ?? body);
                        }}
                    >
                        Вернуть стандартный текст
                    </button>
                ) : null}
            </div>

            <TemplatePreview text={body} code={template.code} bot={bot.data} />
        </FormDialog>
    );
}
