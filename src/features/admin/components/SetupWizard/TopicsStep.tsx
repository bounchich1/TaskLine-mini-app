import { Button } from '@maxhub/max-ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import type { SetupStepProps } from '@/features/admin/hooks/use-setup-wizard';
import { draftOf, saveTopics, type TopicDraft } from '@/features/admin/model/topic-drafts';
import { dictionariesQuery } from '@/shared/api/reference-data';

import { TopicRow } from './TopicRow';

export function TopicsStep({ wizard, formId }: SetupStepProps) {
    const dictionaries = useQuery(dictionariesQuery);
    const [edited, setEdited] = useState<TopicDraft[] | null>(null);
    const [newLabel, setNewLabel] = useState('');

    const tags = (dictionaries.data?.items ?? [])
        .filter((item) => item.dimension === 'tag' && item.code !== 'undefined')
        .sort((left, right) => right.rank - left.rank);

    const drafts = edited ?? tags.map(draftOf);
    const topRank = Math.max(0, ...tags.map((tag) => tag.rank));

    const update = (key: string, changes: Partial<TopicDraft>) => {
        setEdited(drafts.map((draft) => (draft.key === key ? { ...draft, ...changes } : draft)));
    };

    const add = () => {
        const label = newLabel.trim();

        if (label) {
            setEdited([...drafts, { key: `new-${drafts.length}`, entry: null, label, description: '', active: true }]);
            setNewLabel('');
        }
    };

    return (
        <form
            id={formId}
            className="setup-step"
            onSubmit={(event) => {
                event.preventDefault();
                void wizard.run(() => saveTopics(drafts, topRank));
            }}
        >
            <p className="setup-step__lead">
                Отметьте темы, с которыми к вам обращаются. Описание подсказывает ИИ, какие сообщения относятся к теме.
            </p>

            <div className="setup-topics">
                {drafts.map((draft) => (
                    <TopicRow
                        key={draft.key}
                        draft={draft}
                        onChange={(changes) => {
                            update(draft.key, changes);
                        }}
                    />
                ))}
            </div>

            <div className="setup-topics__add">
                <input
                    value={newLabel}
                    maxLength={120}
                    placeholder="Новая тема"
                    aria-label="Новая тема"
                    onChange={(event) => {
                        setNewLabel(event.currentTarget.value);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            add();
                        }
                    }}
                />

                <Button type="button" variant="secondary" size="small" onClick={add}>
                    Добавить
                </Button>
            </div>
        </form>
    );
}
