import type { AiReport } from '@/features/reports/model/types';

import { AiAssistance } from '../AiAssistance/AiAssistance';
import { AiModelUsage } from '../AiModelUsage/AiModelUsage';
import { MetricGroup } from '../MetricGroup/MetricGroup';
import { MetricRow } from '../MetricRow/MetricRow';
import { ShareMeter } from '../ShareMeter/ShareMeter';

import './AiTab.scss';

type AiTabProps = { report: AiReport };

export function AiTab({ report }: AiTabProps) {
    const { accuracy, review } = report;

    return (
        <div className="ai-tab">
            <MetricGroup title="Классификация" note={`закрытых обращений с разбором ИИ: ${accuracy.classified}`}>
                <ShareMeter label="Тема без правок" value={accuracy.tag} hint="сотрудник оставил тему ИИ" />
                <ShareMeter label="Срочность без правок" value={accuracy.urgency} />
                <ShareMeter label="Сложность без правок" value={accuracy.complexity} />
                <ShareMeter label="Всё без правок" value={accuracy.all} />

                <MetricRow
                    label="Требовали проверки"
                    hint={`ИИ сам отметил сомнения · разобрано ${review.triaged}`}
                    kind="share"
                    current={review.rate}
                />
            </MetricGroup>

            <AiAssistance report={report} />
            <AiModelUsage report={report} />
        </div>
    );
}
