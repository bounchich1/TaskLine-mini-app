import { Button } from '@maxhub/max-ui';

import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import { AdminRow } from '@/features/admin/components/AdminRow/AdminRow';
import { strategyLabel } from '@/features/admin/model/team-form';
import { plural } from '@/shared/lib/plural';
import type { Team } from '@/shared/types/routing';
import { Empty } from '@/shared/ui';

type TeamsTabProps = { teams: Team[] | undefined; onEdit: (team: Team | null) => void };

function describe(team: Team): string {
    const members = `${team.members.length} ${plural(team.members.length, ['участник', 'участника', 'участников'])}`;

    const assignment = team.auto_assign
        ? `автоназначение: ${strategyLabel(team.strategy).toLowerCase()}`
        : 'берут сами';

    return [members, assignment, `лимит ${team.capacity}`].join(' · ');
}

export function TeamsTab({ teams, onEdit }: TeamsTabProps) {
    return (
        <AdminCard
            title="Команды"
            action={
                <Button
                    size="small"
                    onClick={() => {
                        onEdit(null);
                    }}
                >
                    Создать команду
                </Button>
            }
        >
            <p className="admin-card__help">
                У каждой команды своя очередь. Правила маршрутизации направляют в неё обращения по теме, срочности и
                сложности, а автоназначение предлагает их сотрудникам на линии.
            </p>

            {teams?.length === 0 ? (
                <Empty title="Команд пока нет">Без команд все обращения попадают в общую очередь.</Empty>
            ) : null}

            <div className="admin-card__list">
                {teams?.map((team) => (
                    <AdminRow key={team.id} wrap>
                        <div className="admin-row__main">
                            <span className="admin-row__title">{team.name}</span>
                            <span className="admin-row__meta">{describe(team)}</span>
                        </div>

                        <span className="admin-row__status">
                            на линии {team.online} · в очереди {team.queue}
                        </span>

                        <Button
                            variant="secondary"
                            size="xsmall"
                            aria-label={`Изменить команду «${team.name}»`}
                            onClick={() => {
                                onEdit(team);
                            }}
                        >
                            Изменить
                        </Button>
                    </AdminRow>
                ))}
            </div>
        </AdminCard>
    );
}
