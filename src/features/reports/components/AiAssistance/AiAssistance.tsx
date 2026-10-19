import { formatCount } from '@/features/reports/model/format';
import type { AiReport } from '@/features/reports/model/types';

import { MetricGroup } from '../MetricGroup/MetricGroup';
import { MetricRow } from '../MetricRow/MetricRow';

type AiAssistanceProps = { report: AiReport };

export function AiAssistance({ report }: AiAssistanceProps) {
    const { drafts, grounding, knowledge, engagement } = report;
    const learnedWeeks = knowledge.weekly.map((week) => week.learned).join(' · ');

    return (
        <>
            <MetricGroup title="Подсказки и черновики" note={`ответов клиентам: ${formatCount(drafts.replies)}`}>
                <MetricRow
                    label="Ответов из черновика ИИ"
                    hint="«Вставить в черновик»"
                    kind="share"
                    current={drafts.ai_share}
                />

                <MetricRow label="Обращений с черновиком ИИ" kind="share" current={drafts.ticket_share} />

                <MetricRow
                    label="Сотрудник изменил черновик"
                    hint="медиана доли изменённых слов"
                    kind="share"
                    current={drafts.edit_p50}
                />

                <MetricRow label="Ответов из шаблонов" kind="share" current={drafts.macro_share} />

                <MetricRow
                    label="Подсказки со ссылкой на решённый случай"
                    hint={`подсказок: ${formatCount(grounding.tipped)}`}
                    kind="share"
                    current={grounding.share}
                />

                <MetricRow
                    label="Решение с источником"
                    hint="медиана"
                    kind="duration"
                    current={grounding.grounded_resolution_p50}
                />

                <MetricRow
                    label="Решение без источника"
                    hint="медиана"
                    kind="duration"
                    current={grounding.ungrounded_resolution_p50}
                />

                <MetricRow
                    label="Подсказку открывали"
                    hint={`просмотров: ${formatCount(engagement.tip_views)}`}
                    kind="count"
                    current={engagement.tip_viewed_tickets}
                    note="обращений"
                />

                <MetricRow
                    label="Открыли источник подсказки"
                    kind="count"
                    current={engagement.sources_opened}
                    note="раз"
                />
            </MetricGroup>

            <MetricGroup title="База знаний">
                <MetricRow
                    label="Выучено закрытых обращений"
                    hint={learnedWeeks ? `по неделям: ${learnedWeeks}` : undefined}
                    kind="count"
                    current={knowledge.learned}
                />

                <MetricRow label="Решений в базе сейчас" kind="count" current={knowledge.eligible_records} />

                <MetricRow
                    label="Похожих случаев на обращение"
                    hint="в среднем"
                    kind="score"
                    current={knowledge.recall_hits}
                />
            </MetricGroup>
        </>
    );
}
