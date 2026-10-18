import type { Dictionary } from '@/shared/types/api';

export function TopicCoverage({ dictionaries }: { dictionaries: readonly Dictionary[] }) {
    const topics = dictionaries.filter((item) => item.dimension === 'tag' && item.active && item.code !== 'undefined');
    const missing = topics.filter((item) => !item.description);

    return (
        <p className="admin-card__help">
            Описано тем: {topics.length - missing.length} из {topics.length}.{' '}
            {missing.length ? `Без описания: ${missing.map((item) => item.label).join(', ')}. ` : null}
            ИИ сравнивает сообщение клиента с описаниями и примерами во вкладке «Темы и уровни».
        </p>
    );
}
