import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Fragment, useMemo, type Dispatch, type ReactNode, type SetStateAction } from 'react';

import { buildTicketColumns } from '@/features/ticket-queue/model/columns';
import type { QueueTab } from '@/features/ticket-queue/model/filter-defaults';
import type { Ticket } from '@/shared/types/api';

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
    <div className="table-scroll">
      <table className="ticket-table">
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <tr className={expanded === row.original.id ? 'ticket-row expanded' : 'ticket-row'}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
              {expanded === row.original.id ? (
                <tr className="detail-row">
                  <td colSpan={columns.length}>{detail}</td>
                </tr>
              ) : null}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
