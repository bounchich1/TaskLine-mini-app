import { Button } from '@maxhub/max-ui';
import { useState } from 'react';

import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import type { RoutingRule, StoredRoutingRule } from '@/features/admin/model/types';
import type { Dictionary } from '@/shared/types/api';
import type { Team } from '@/shared/types/routing';
import { Empty } from '@/shared/ui';

import { RuleRow } from './RuleRow';

import './RoutingTab.scss';

type RoutingTabProps = {
    rules: { items: StoredRoutingRule[]; version: number };
    teams: Team[];
    dictionaries: Dictionary[];
    busy: boolean;
    save: AdminSave;
};

const emptyRule = (teamId: string): RoutingRule => ({
    team_id: teamId,
    match: { tag: [], urgency: [], complexity: [] },
});

const normalizeRule = (rule: StoredRoutingRule): RoutingRule => ({
    ...rule,
    match: { tag: rule.match.tag ?? [], urgency: rule.match.urgency ?? [], complexity: rule.match.complexity ?? [] },
});

export function RoutingTab({ rules, teams, dictionaries, busy, save }: RoutingTabProps) {
    const [draft, setDraft] = useState<RoutingRule[]>(() => rules.items.map(normalizeRule));
    const firstTeam = teams.at(0)?.id;

    const update = (index: number, rule: RoutingRule | null) => {
        setDraft((current) => {
            const next = [...current];

            if (rule) {
                next.splice(index, 1, rule);
            } else {
                next.splice(index, 1);
            }

            return next;
        });
    };

    const move = (index: number, step: number) => {
        setDraft((current) => {
            const next = [...current];
            const moved = next.splice(index, 1);

            next.splice(Math.max(0, Math.min(next.length, index + step)), 0, ...moved);

            return next;
        });
    };

    if (!teams.length) {
        return (
            <AdminCard title="Правила маршрутизации">
                <Empty title="Сначала создайте команду">Правила направляют обращения в очереди команд.</Empty>
            </AdminCard>
        );
    }

    return (
        <AdminCard
            title="Правила маршрутизации"
            action={
                <Button
                    size="small"
                    loading={busy}
                    onClick={() => {
                        void save('/v1/admin/routing-rules', {
                            method: 'PUT',
                            body: { rules: draft.map(({ team_id: teamId, match }) => ({ team_id: teamId, match })) },
                            version: rules.version,
                        });
                    }}
                >
                    Сохранить
                </Button>
            }
        >
            <p className="admin-card__help">
                После разбора ИИ и при ручной смене темы правила проверяются сверху вниз: первое подходящее выбирает
                команду. Пустое условие — подходит любое значение. Изменение правил не переносит уже назначенные
                обращения.
            </p>

            <ol className="routing-tab__rules">
                {draft.map((rule, index) => (
                    <RuleRow
                        key={`${rule.id ?? 'new'}-${index}`}
                        index={index}
                        total={draft.length}
                        rule={rule}
                        teams={teams}
                        dictionaries={dictionaries}
                        onChange={(next) => {
                            update(index, next);
                        }}
                        onMove={(step) => {
                            move(index, step);
                        }}
                    />
                ))}
            </ol>

            {firstTeam ? (
                <Button
                    className="routing-tab__add"
                    variant="secondary"
                    size="small"
                    onClick={() => {
                        setDraft((current) => [...current, emptyRule(firstTeam)]);
                    }}
                >
                    Добавить правило
                </Button>
            ) : null}
        </AdminCard>
    );
}
