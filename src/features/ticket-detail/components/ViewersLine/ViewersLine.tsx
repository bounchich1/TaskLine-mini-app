import { useTicketViewers } from '@/shared/api/ticket-viewers';

import './ViewersLine.scss';

type ViewersLineProps = { ticketId: string; me: string };

function names(list: { name: string }[]): string {
    const first = list.map((viewer) => viewer.name.split(' ')[0] ?? viewer.name);

    return first.length > 2 ? `${first.slice(0, 2).join(', ')} и ещё ${first.length - 2}` : first.join(' и ');
}

export function ViewersLine({ ticketId, me }: ViewersLineProps) {
    const others = useTicketViewers(ticketId).filter((viewer) => viewer.id !== me);

    if (!others.length) {
        return null;
    }

    const typing = others.filter((viewer) => viewer.typing);
    const watching = others.filter((viewer) => !viewer.typing);

    return (
        <p className="viewers-line" role="status">
            {typing.length ? (
                <span className="viewers-line__typing">
                    {names(typing)} {typing.length > 1 ? 'печатают' : 'печатает'}…
                </span>
            ) : null}

            {watching.length ? (
                <span>
                    {names(watching)} {watching.length > 1 ? 'просматривают' : 'просматривает'}
                </span>
            ) : null}
        </p>
    );
}
