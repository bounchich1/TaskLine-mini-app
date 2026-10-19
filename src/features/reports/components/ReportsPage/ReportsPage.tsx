import { clsx } from 'clsx';
import { useState } from 'react';

import { presetRange, type ReportRange } from '@/features/reports/model/period';
import type { ReportName } from '@/features/reports/model/types';
import { dayKey } from '@/shared/lib/format-date';
import { useNow } from '@/shared/lib/use-now';
import { PageHeader } from '@/shared/ui';

import { ExportButtons } from '../ExportButtons/ExportButtons';
import { PeriodPicker } from '../PeriodPicker/PeriodPicker';
import { ReportView } from '../ReportView/ReportView';

import './ReportsPage.scss';

const TABS: readonly { name: ReportName; label: string }[] = [
    { name: 'overview', label: 'Обзор' },
    { name: 'team', label: 'Команда' },
    { name: 'topics', label: 'Темы' },
    { name: 'ai', label: 'ИИ' },
    { name: 'quality', label: 'Качество' },
];

type ReportsPageProps = { timezone: string; onTicket: (id: string) => void };

export function ReportsPage({ timezone, onTicket }: ReportsPageProps) {
    const [tab, setTab] = useState<ReportName>('overview');
    const [range, setRange] = useState<ReportRange>(() => presetRange('week', timezone));
    const today = dayKey(useNow(), timezone);

    return (
        <div className="reports-page">
            <PageHeader title="Отчёты" />

            <div className="reports-page__filters">
                <PeriodPicker range={range} timezone={timezone} today={today} onChange={setRange} />
                <ExportButtons name={tab} range={range} />
            </div>

            <div className="reports-tabs" role="tablist" aria-label="Отчёты">
                {TABS.map((item) => (
                    <button
                        key={item.name}
                        role="tab"
                        aria-selected={tab === item.name}
                        className={clsx('reports-tabs__tab', tab === item.name && 'reports-tabs__tab--selected')}
                        onClick={() => {
                            setTab(item.name);
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <div role="tabpanel" aria-label={TABS.find((item) => item.name === tab)?.label}>
                <ReportView name={tab} range={range} onTicket={onTicket} />
            </div>
        </div>
    );
}
