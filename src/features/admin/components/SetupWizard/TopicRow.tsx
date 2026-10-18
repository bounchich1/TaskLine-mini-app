import { clsx } from 'clsx';

import type { TopicDraft } from '@/features/admin/model/topic-drafts';

type TopicRowProps = { draft: TopicDraft; onChange: (changes: Partial<TopicDraft>) => void };

export function TopicRow({ draft, onChange }: TopicRowProps) {
    return (
        <div className={clsx('setup-topic', !draft.active && 'setup-topic--off')}>
            <input
                type="checkbox"
                className="setup-topic__toggle"
                checked={draft.active}
                aria-label={`Использовать тему «${draft.label}»`}
                onChange={(event) => {
                    onChange({ active: event.currentTarget.checked });
                }}
            />

            <div className="setup-topic__fields">
                <input
                    value={draft.label}
                    maxLength={120}
                    required
                    aria-label="Название темы"
                    onChange={(event) => {
                        onChange({ label: event.currentTarget.value });
                    }}
                />

                <input
                    value={draft.description}
                    maxLength={200}
                    placeholder="Когда клиент пишет о… (для ИИ)"
                    aria-label={`Описание темы «${draft.label}»`}
                    onChange={(event) => {
                        onChange({ description: event.currentTarget.value });
                    }}
                />
            </div>
        </div>
    );
}
