import { Button } from '@maxhub/max-ui';
import { useState } from 'react';

import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import { draftFrom, payloadFrom, type SlaDraft } from '@/features/admin/model/sla-form';
import type { Dictionary, SlaConfig } from '@/shared/types/api';
import { CheckboxField, FormField } from '@/shared/ui';

import { SlaHolidays } from '../SlaHolidays/SlaHolidays';
import { SlaPolicies } from '../SlaPolicies/SlaPolicies';
import { SlaWeek } from '../SlaWeek/SlaWeek';

import './SlaTab.scss';

type SlaTabProps = {
    config: SlaConfig;
    dictionaries: Dictionary[];
    busy: boolean;
    save: AdminSave;
};

export function SlaTab({ config, dictionaries, busy, save }: SlaTabProps) {
    const [draft, setDraft] = useState<SlaDraft>(() => draftFrom(config));

    const update = (patch: Partial<SlaDraft>) => {
        setDraft((current) => ({ ...current, ...patch }));
    };

    return (
        <form
            className="sla-tab"
            onSubmit={(event) => {
                event.preventDefault();
                void save('/v1/admin/sla', { method: 'PUT', body: payloadFrom(draft), version: config.version });
            }}
        >
            <AdminCard title="Сроки обслуживания">
                <div className="sla-tab__options">
                    <CheckboxField
                        name="enabled"
                        checked={draft.enabled}
                        onChange={(enabled) => {
                            update({ enabled });
                        }}
                    >
                        Считать сроки и предупреждать о нарушениях
                    </CheckboxField>

                    <CheckboxField
                        name="notify_max"
                        checked={draft.notifyMax}
                        onChange={(notifyMax) => {
                            update({ notifyMax });
                        }}
                    >
                        Дублировать предупреждения сотрудникам в MAX
                    </CheckboxField>

                    <CheckboxField
                        name="client_eta"
                        checked={draft.clientEta}
                        onChange={(clientEta) => {
                            update({ clientEta });
                        }}
                    >
                        Сообщать клиенту срок ответа
                    </CheckboxField>
                </div>

                <SlaPolicies draft={draft} dictionaries={dictionaries} onChange={update} />

                <p className="admin-card__help">
                    Время рабочее, по часовому поясу {config.timezone}. Пустая строка — срок не считается. Новые сроки
                    действуют для новых обращений.
                </p>
            </AdminCard>

            <AdminCard title="Рабочее время">
                <SlaWeek
                    days={draft.days}
                    onChange={(days) => {
                        update({ days });
                    }}
                />
            </AdminCard>

            <SlaHolidays
                holidays={draft.holidays}
                workdays={draft.workdays}
                onChange={(patch) => {
                    update(patch);
                }}
            />

            <AdminCard title="Ожидание ответа клиента">
                <div className="sla-tab__timers">
                    <FormField label="Напомнить через, ч" hint="0 — не напоминать">
                        <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={720}
                            value={draft.reminder}
                            onChange={(event) => {
                                update({ reminder: event.currentTarget.value });
                            }}
                        />
                    </FormField>

                    <FormField label="Закрыть через, ч" hint="0 — не закрывать">
                        <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={2160}
                            value={draft.close}
                            onChange={(event) => {
                                update({ close: event.currentTarget.value });
                            }}
                        />
                    </FormField>
                </div>
            </AdminCard>

            <Button className="sla-tab__submit" type="submit" size="small" loading={busy}>
                Сохранить
            </Button>
        </form>
    );
}
