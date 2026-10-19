import { useState } from 'react';

import { fetchBlob, saveBlob } from '@/shared/api/download';
import { api } from '@/shared/api/http';
import { bridge } from '@/shared/platform/max-bridge';

import type { ReportRange } from '../model/period';
import type { ReportName } from '../model/types';

export type ExportFormat = 'csv' | 'xlsx';

type ExportGrant = { url: string; filename: string; expires_at: string; format: ExportFormat; key: string };

const filename = (name: ReportName, format: ExportFormat, range: ReportRange) =>
    `taskline-${name}-${range.from}_${range.to}.${format}`;

export function useReportExport(name: ReportName, range: ReportRange) {
    const [grant, setGrant] = useState<ExportGrant | null>(null);
    const [busy, setBusy] = useState<ExportFormat | null>(null);
    const [error, setError] = useState<unknown>(null);
    const host = bridge();
    const native = host?.platform !== 'web' && !!host?.downloadFile;
    const key = `${name}:${range.from}:${range.to}`;

    const ready = (format: ExportFormat) =>
        grant?.format === format && grant.key === key && Date.parse(grant.expires_at) > Date.now();

    const download = (format: ExportFormat) => {
        setError(null);

        if (native && grant && ready(format)) {
            void Promise.resolve(bridge()?.downloadFile?.(grant.url, grant.filename)).catch(setError);

            return;
        }

        setBusy(format);

        const request = native
            ? api<Omit<ExportGrant, 'format' | 'key'>>(`/v1/reports/${name}/export-grant`, {
                  method: 'POST',
                  body: { format, from: range.from, to: range.to },
              }).then((created) => {
                  setGrant({ ...created, format, key });
              })
            : fetchBlob(`/v1/reports/${name}/export?format=${format}&from=${range.from}&to=${range.to}`).then(
                  (blob) => {
                      saveBlob(blob, filename(name, format, range));
                  },
              );

        void request.catch(setError).finally(() => {
            setBusy(null);
        });
    };

    return { download, busy, error, needsGrant: (format: ExportFormat) => native && !ready(format) };
}
