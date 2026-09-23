import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { clsx } from 'clsx';
import { Fragment, useMemo, type Dispatch, type ReactNode, type SetStateAction } from 'react';

import { buildTicketColumns } from '@/features/ticket-queue/model/columns';
import type { QueueTab } from '@/features/ticket-queue/model/filter-defaults';
import type { Ticket } from '@/shared/types/api';

import './TicketTable.scss';

type TicketTableProps = {
  rows: Ticket[];
  tab: QueueTab;
  timezone: string;
  expanded: string | null;
  onExpand: Dispatch<SetStateAction<string | null>>;
  /** The expanded ticket's card, shown in a full-width row under it. */
  detail: ReactNode;
};

/** The queue table; the expanded ticket opens inline under its row. */
export function TicketTable({ rows, tab, timezone, expanded, onExpand, detail }: TicketTableProps) {
  const columns = useMemo(
    () => buildTicketColumns({ expanded, onExpand, tab, timezone }),
    [expanded, onExpand, tab, timezone],
  );
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });
  return (
    <div className="ticket-table">
      <table className="ticket-table__table">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th className="ticket-table__head-cell" key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <tr
                className={clsx(
                  'ticket-table__row',
                  expanded === row.original.id && 'ticket-table__row--expanded',
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td className="ticket-table__cell" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              {expanded === row.original.id ? (
                <tr>
                  <td className="ticket-table__detail-cell" colSpan={columns.length}>
                    {detail}
                  </td>
                </tr>
              ) : null}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
