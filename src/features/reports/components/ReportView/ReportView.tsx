import { clsx } from 'clsx';

import { useReport } from '@/features/reports/hooks/use-report';
import type { ReportRange } from '@/features/reports/model/period';
import type { ReportByName, ReportName } from '@/features/reports/model/types';
import { ErrorNotice } from '@/shared/ui';

import { AiTab } from '../AiTab/AiTab';
import { OverviewTab } from '../OverviewTab/OverviewTab';
import { QualityTab } from '../QualityTab/QualityTab';
import { TeamTab } from '../TeamTab/TeamTab';
import { TopicsTab } from '../TopicsTab/TopicsTab';

type ReportViewProps = { name: ReportName; range: ReportRange; onTicket: (id: string) => void };

function content(report: ReportByName[ReportName], onTicket: (id: string) => void) {
    switch (report.report) {
        case 'overview':
            return <OverviewTab report={report} />;
        case 'team':
            return <TeamTab report={report} />;
        case 'topics':
            return <TopicsTab report={report} />;
        case 'ai':
            return <AiTab report={report} />;
        case 'quality':
            return <QualityTab report={report} onTicket={onTicket} />;
    }
}

export function ReportView({ name, range, onTicket }: ReportViewProps) {
    const query = useReport(name, range);
    const report = query.data?.report === name ? query.data : undefined;

    return (
        <div
            className={clsx('report-view', report && query.isPlaceholderData && 'report-view--stale')}
            aria-busy={query.isFetching}
        >
            <ErrorNotice error={query.error} />
            {report ? content(report, onTicket) : null}
            {!report && !query.error ? <p className="report-view__loading">Считаем показатели…</p> : null}
        </div>
    );
}
