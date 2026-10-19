import type { Ticket } from '@/shared/types/api';
import type { Team } from '@/shared/types/routing';
import { Select } from '@/shared/ui';

import { PropertyRow } from '../PropertyRow/PropertyRow';

type TeamFieldProps = {
    ticket: Ticket;
    teams: Team[];
    disabled: boolean;
    onChange: (teamId: string | null) => void;
};

export function TeamField({ ticket, teams, disabled, onChange }: TeamFieldProps) {
    if (!teams.length && !ticket.team_id) {
        return null;
    }

    const options = [
        { value: '', label: 'Общая очередь' },
        ...teams.map((team) => ({ value: team.id, label: team.name })),
    ];

    if (ticket.team_id && !teams.some((team) => team.id === ticket.team_id)) {
        options.push({ value: ticket.team_id, label: ticket.team_name ?? 'Команда в архиве' });
    }

    return (
        <PropertyRow label="Команда">
            <Select
                className="property-row__select"
                appearance="plain"
                aria-label="Перевести в очередь команды"
                disabled={disabled}
                options={options}
                value={ticket.team_id ?? ''}
                onChange={(value) => {
                    onChange(value || null);
                }}
            />
        </PropertyRow>
    );
}
