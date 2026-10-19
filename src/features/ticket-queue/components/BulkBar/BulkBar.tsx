import { Button } from '@maxhub/max-ui';
import { useState } from 'react';

import type { Bulk } from '@/features/ticket-queue/hooks/use-bulk';
import { plural } from '@/shared/lib/plural';
import type { Dictionary, Employee } from '@/shared/types/api';
import type { Team } from '@/shared/types/routing';
import { DictionarySelect, ErrorNotice, Select } from '@/shared/ui';

import { BulkCloseDialog } from '../BulkCloseDialog/BulkCloseDialog';

import './BulkBar.scss';

type BulkBarProps = {
    bulk: Bulk;
    employees: Employee[];
    teams: Team[];
    dictionaries: Dictionary[] | undefined;
};

export function BulkBar({ bulk, employees, teams, dictionaries }: BulkBarProps) {
    const [closing, setClosing] = useState(false);
    const count = bulk.selected.size;
    const busy = bulk.run.isPending;

    if (!count && !bulk.summary) {
        return null;
    }

    return (
        <div className="bulk-bar" role="region" aria-label="Массовые действия">
            <span className="bulk-bar__count">
                Выбрано {count} {plural(count, ['обращение', 'обращения', 'обращений'])}
            </span>

            {count ? (
                <>
                    <Select
                        className="bulk-bar__select"
                        aria-label="Назначить сотруднику"
                        placeholder="Назначить"
                        value=""
                        disabled={busy}
                        options={employees
                            .filter((employee) => employee.status === 'active')
                            .map((employee) => ({ value: employee.id, label: employee.name }))}
                        onChange={(value) => {
                            bulk.run.mutate({ action: 'assign', employee_id: value });
                        }}
                    />

                    {teams.length ? (
                        <Select
                            className="bulk-bar__select"
                            aria-label="Перевести в команду"
                            placeholder="В команду"
                            value=""
                            disabled={busy}
                            options={[
                                { value: 'none', label: 'Общая очередь' },
                                ...teams.map((team) => ({ value: team.id, label: team.name })),
                            ]}
                            onChange={(value) => {
                                bulk.run.mutate({ action: 'team', team_id: value === 'none' ? null : value });
                            }}
                        />
                    ) : null}

                    <DictionarySelect
                        className="bulk-bar__select"
                        aria-label="Изменить тему"
                        placeholder="Тема"
                        value=""
                        items={dictionaries}
                        dimension="tag"
                        activeOnly
                        disabled={busy}
                        onChange={(value) => {
                            bulk.run.mutate({ action: 'classify', tag: value });
                        }}
                    />

                    <DictionarySelect
                        className="bulk-bar__select"
                        aria-label="Изменить срочность"
                        placeholder="Срочность"
                        value=""
                        items={dictionaries}
                        dimension="urgency"
                        activeOnly
                        disabled={busy}
                        onChange={(value) => {
                            bulk.run.mutate({ action: 'classify', urgency: value });
                        }}
                    />

                    <Button
                        size="xsmall"
                        variant="secondary"
                        disabled={busy}
                        onClick={() => {
                            setClosing(true);
                        }}
                    >
                        Закрыть…
                    </Button>
                </>
            ) : null}

            <button type="button" className="bulk-bar__clear" onClick={bulk.clear}>
                Снять выбор
            </button>

            {bulk.summary ? (
                <p className="bulk-bar__summary" role="status">
                    Готово: {bulk.summary.done}.
                    {bulk.summary.failed.length
                        ? ` Не получилось: ${bulk.summary.failed.map((item) => `№${item.number ?? '?'} — ${item.message ?? item.code ?? ''}`).join('; ')}`
                        : ''}
                </p>
            ) : null}

            <ErrorNotice error={bulk.run.error} />

            {closing ? (
                <BulkCloseDialog
                    count={count}
                    busy={busy}
                    onClose={() => {
                        setClosing(false);
                    }}
                    onSubmit={(text) => {
                        bulk.run.mutate(
                            { action: 'close', ...(text ? { text } : {}) },
                            {
                                onSettled: () => {
                                    setClosing(false);
                                },
                            },
                        );
                    }}
                />
            ) : null}
        </div>
    );
}
