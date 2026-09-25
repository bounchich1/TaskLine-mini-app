import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { clsx } from 'clsx';
import { useMemo } from 'react';

import { buildTicketColumns } from '@/features/ticket-queue/model/columns';
import type { QueueTab } from '@/features/ticket-queue/model/filter-defaults';
import type { Ticket } from '@/shared/types/api';

import './TicketTable.scss';

type TicketTableProps = {
  rows: Ticket[];
  tab: QueueTab;
  timezone: string;
  expanded: string | null;
  onToggle: (id: string) => void;
};

/** The queue as a table with every column, when the screen has room and no ticket is open. */
export function TicketTable({ rows, tab, timezone, expanded, onToggle }: TicketTableProps) {
  const columns = useMemo(
    () => buildTicketColumns({ expanded, onToggle, tab, timezone }),
    [expanded, onToggle, tab, timezone],
  );
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
          // The number cell's button is the keyboard and screen reader path; a click anywhere on
          // the row is a pointer shortcut to the same action.
          <tr
            key={row.id}
            className="ticket-table__row"
            onClick={(event) => {
              if (!(event.target instanceof HTMLButtonElement)) {
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
