import { Button } from '@maxhub/max-ui';
import { useQuery } from '@tanstack/react-query';

import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import { MacroFields, macroPayload } from '@/features/routing';
import { dictionariesQuery } from '@/shared/api/reference-data';
import type { Macro } from '@/shared/types/routing';

import { FormDialog } from '../FormDialog/FormDialog';

import './MacroDialog.scss';

type MacroDialogProps = {
    macro: Macro | null;
    busy: boolean;
    error: unknown;
    save: AdminSave;
    onClose: () => void;
};

export function MacroDialog({ macro, busy, error, save, onClose }: MacroDialogProps) {
    const dictionaries = useQuery(dictionariesQuery);

    const submit = (form: FormData) => {
        const body = macroPayload(form, true);

        void (macro
            ? save(`/v1/macros/${macro.id}`, { method: 'PATCH', body, version: macro.version })
            : save('/v1/macros', { method: 'POST', body }));
    };

    return (
        <FormDialog
            title={macro ? 'Шаблон ответа' : 'Новый шаблон ответа'}
            formId="macro-form"
            busy={busy}
            error={error}
            onClose={onClose}
            onSubmit={submit}
            wide
        >
            <MacroFields macro={macro} dictionaries={dictionaries.data?.items} />

            {macro ? (
                <Button
                    className="macro-dialog__delete"
                    type="button"
                    variant="secondary"
                    size="small"
                    disabled={busy}
                    onClick={() => {
                        void save(`/v1/macros/${macro.id}`, { method: 'DELETE', version: macro.version });
                    }}
                >
                    Удалить шаблон
                </Button>
            ) : null}
        </FormDialog>
    );
}
