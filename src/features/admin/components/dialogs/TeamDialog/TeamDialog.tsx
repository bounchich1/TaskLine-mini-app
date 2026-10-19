import { Button } from '@maxhub/max-ui';
import { useQuery } from '@tanstack/react-query';

import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import { STRATEGY_OPTIONS, teamDefaults, teamPayload } from '@/features/admin/model/team-form';
import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';
import { dictionariesQuery } from '@/shared/api/reference-data';
import type { Employee } from '@/shared/types/api';
import type { Team } from '@/shared/types/routing';
import { CheckboxField, FormField, Select } from '@/shared/ui';

import { FormDialog } from '../FormDialog/FormDialog';

import { TeamMembers } from './TeamMembers';

import './TeamDialog.scss';

type TeamDialogProps = {
    team: Team | null;
    busy: boolean;
    error: unknown;
    save: AdminSave;
    onClose: () => void;
};

export function TeamDialog({ team, busy, error, save, onClose }: TeamDialogProps) {
    const initial = teamDefaults(team);

    const employees = useQuery({
        queryKey: queryKeys.adminEmployees,
        queryFn: () => api<{ items: Employee[] }>('/v1/admin/employees'),
    });

    const dictionaries = useQuery(dictionariesQuery);
    const people = (employees.data?.items ?? []).filter((employee) => employee.status !== 'blocked');
    const supervisors = people.filter((employee) => employee.role !== 'support');

    const submit = (form: FormData) => {
        const body = teamPayload(form);

        void (team
            ? save(`/v1/admin/teams/${team.id}`, { method: 'PATCH', body, version: team.version })
            : save('/v1/admin/teams', { method: 'POST', body }));
    };

    return (
        <FormDialog
            title={initial.title}
            formId="team-form"
            busy={busy}
            error={error}
            onClose={onClose}
            onSubmit={submit}
            wide
        >
            <div className="team-dialog">
                <FormField label="Название">
                    <input name="name" defaultValue={initial.name} maxLength={80} required />
                </FormField>

                <FormField label="Руководитель команды" hint="Видит очередь команды и получает предупреждения SLA.">
                    <Select
                        name="supervisor_id"
                        defaultValue={initial.supervisor}
                        options={[
                            { value: '', label: 'Не назначен' },
                            ...supervisors.map((employee) => ({ value: employee.id, label: employee.name })),
                        ]}
                    />
                </FormField>

                <CheckboxField name="auto_assign" defaultChecked={initial.autoAssign}>
                    Автоматически предлагать обращения сотрудникам на линии
                </CheckboxField>

                <div className="team-dialog__row">
                    <FormField label="Кому предлагать">
                        <Select name="strategy" defaultValue={initial.strategy} options={STRATEGY_OPTIONS} />
                    </FormField>

                    <FormField label="Лимит в работе" hint="обращений на сотрудника">
                        <input
                            name="capacity"
                            type="number"
                            min={1}
                            max={100}
                            defaultValue={initial.capacity}
                            required
                        />
                    </FormField>

                    <FormField label="Ждать ответа на предложение" hint="минут, потом — следующему">
                        <input
                            name="offer_timeout_minutes"
                            type="number"
                            min={1}
                            max={60}
                            step={0.5}
                            defaultValue={initial.offerMinutes}
                            required
                        />
                    </FormField>
                </div>

                <CheckboxField name="allow_self_take" defaultChecked={initial.allowSelfTake}>
                    Сотрудники могут сами брать обращения из очереди команды
                </CheckboxField>

                <TeamMembers people={people} dictionaries={dictionaries.data?.items} skills={initial.skills} />

                {team ? (
                    <Button
                        className="team-dialog__archive"
                        type="button"
                        variant="secondary"
                        size="small"
                        disabled={busy}
                        onClick={() => {
                            void save(`/v1/admin/teams/${team.id}`, { method: 'DELETE', version: team.version });
                        }}
                    >
                        Расформировать команду
                    </Button>
                ) : null}
            </div>
        </FormDialog>
    );
}
