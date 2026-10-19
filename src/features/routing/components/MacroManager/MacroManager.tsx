import { Button } from '@maxhub/max-ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { macroPayload } from '@/features/routing/model/macros';
import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';
import { dictionariesQuery, macrosQuery } from '@/shared/api/reference-data';
import type { Macro } from '@/shared/types/routing';
import { ErrorNotice, Modal } from '@/shared/ui';

import { MacroFields } from '../MacroFields/MacroFields';
import { MacroList } from '../MacroList/MacroList';

import './MacroManager.scss';

type MacroManagerProps = { employeeId: string; onClose: () => void };

const FORM_ID = 'personal-macro-form';

export function MacroManager({ employeeId, onClose }: MacroManagerProps) {
    const cache = useQueryClient();
    const macros = useQuery(macrosQuery);
    const dictionaries = useQuery(dictionariesQuery);
    const [editing, setEditing] = useState<Macro | 'new' | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const personal = macros.data?.items.filter((macro) => macro.owner_id === employeeId) ?? [];

    const run = async (request: () => Promise<unknown>) => {
        setBusy(true);
        setError(null);

        try {
            await request();
            await cache.invalidateQueries({ queryKey: queryKeys.macros });
            setEditing(null);
        } catch (failure) {
            setError(failure);
        } finally {
            setBusy(false);
        }
    };

    const submit = (form: FormData) => {
        const body = macroPayload(form, false);
        const current = editing === 'new' ? null : editing;

        void run(() =>
            current
                ? api(`/v1/macros/${current.id}`, { method: 'PATCH', body, version: current.version })
                : api('/v1/macros', { method: 'POST', body }),
        );
    };

    const remove = (macro: Macro) => {
        void run(() => api(`/v1/macros/${macro.id}`, { method: 'DELETE', version: macro.version }));
    };

    const back = () => {
        setEditing(null);
    };

    const footer = editing ? (
        <Button form={FORM_ID} type="submit" size="small" loading={busy}>
            Сохранить
        </Button>
    ) : (
        <Button
            size="small"
            onClick={() => {
                setEditing('new');
            }}
        >
            Новый шаблон
        </Button>
    );

    return (
        <Modal title="Мои шаблоны ответов" onClose={editing ? back : onClose} busy={busy} footer={footer} wide>
            <ErrorNotice error={error ?? macros.error} />

            {editing ? (
                <form
                    id={FORM_ID}
                    onSubmit={(event) => {
                        event.preventDefault();
                        submit(new FormData(event.currentTarget));
                    }}
                >
                    <MacroFields macro={editing === 'new' ? null : editing} dictionaries={dictionaries.data?.items} />
                </form>
            ) : null}

            {editing ? null : <MacroList macros={personal} busy={busy} onEdit={setEditing} onRemove={remove} />}
        </Modal>
    );
}
