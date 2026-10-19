import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { clsx } from 'clsx';
import { useMemo } from 'react';

import { buildTicketColumns, selectColumn, type Selection } from '@/features/ticket-queue/model/columns';
import type { QueueTab } from '@/features/ticket-queue/model/filter-defaults';
import type { Ticket } from '@/shared/types/api';

import './TicketTable.scss';

type TicketTableProps = {
    rows: Ticket[];
    tab: QueueTab;
    timezone: string;
    expanded: string | null;
    onToggle: (id: string) => void;
    selection?: Selection;
};

const isControl = (target: EventTarget) =>
    target instanceof HTMLButtonElement || target instanceof HTMLInputElement || target instanceof HTMLLabelElement;

export function TicketTable({ rows, tab, timezone, expanded, onToggle, selection }: TicketTableProps) {
    const columns = useMemo(() => {
        const base = buildTicketColumns({ expanded, onToggle, tab, timezone });

        return selection ? [selectColumn(rows, selection), ...base] : base;
    }, [expanded, onToggle, tab, timezone, rows, selection]);

    const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

    return (
        <table className={clsx('ticket-table', `ticket-table--${tab}`)}>
            <thead>
                {table.getHeaderGroups().map((group) => (
                    <tr key={group.id}>
                        {group.headers.map((header) => (
                            <th
                                className={`ticket-table__head-cell ticket-table__head-cell--${header.id}`}
                                key={header.id}
                            >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>

            <tbody>
                {table.getRowModel().rows.map((row) => (
                    <tr
                        key={row.id}
                        className={clsx(
                            'ticket-table__row',
                            selection?.selected.has(row.original.id) && 'ticket-table__row--selected',
                        )}
                        onClick={(event) => {
                            if (!isControl(event.target)) {
                                onToggle(row.original.id);
                            }
                        }}
                    >
                        {row.getVisibleCells().map((cell) => (
                            <td className="ticket-table__cell" key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
