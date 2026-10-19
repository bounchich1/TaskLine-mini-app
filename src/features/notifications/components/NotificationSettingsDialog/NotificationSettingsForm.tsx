import { Button } from '@maxhub/max-ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useSaveNotificationSettings } from '@/features/notifications/hooks/use-notifications';
import { dictionariesQuery } from '@/shared/api/reference-data';
import type { NotificationSettings } from '@/shared/types/notifications';
import { CheckboxField, ChoiceList, ErrorNotice, Modal } from '@/shared/ui';

const NEW_TICKET_OPTIONS = [
    { value: 'all', title: 'Обо всех', note: 'Уведомление о каждом новом обращении' },
    { value: 'topics', title: 'Только по моим темам', note: 'Придёт, когда ИИ или коллега определит тему' },
    { value: 'off', title: 'Не уведомлять', note: 'Новые обращения остаются в очереди' },
] as const;

type NewTickets = NotificationSettings['new_tickets'];

type SettingsFormProps = {
    initial: NotificationSettings;
    onClose: () => void;
};

export function NotificationSettingsForm({ initial, onClose }: SettingsFormProps) {
    const [form, setForm] = useState(initial);
    const save = useSaveNotificationSettings(onClose);
    const dictionaries = useQuery(dictionariesQuery);

    const topics = (dictionaries.data?.items ?? [])
        .filter((entry) => entry.dimension === 'tag' && (entry.active || form.topics.includes(entry.code)))
        .sort((left, right) => right.rank - left.rank);

    const toggleTopic = (code: string, on: boolean) => {
        setForm({
            ...form,
            topics: on ? [...form.topics, code] : form.topics.filter((topic) => topic !== code),
        });
    };

    const missingTopics = form.new_tickets === 'topics' && !form.topics.length;

    return (
        <Modal
            title="Настройки уведомлений"
            busy={save.isPending}
            onClose={onClose}
            footer={
                <Button
                    size="small"
                    loading={save.isPending}
                    disabled={missingTopics}
                    onClick={() => {
                        save.mutate(form);
                    }}
                >
                    Сохранить
                </Button>
            }
        >
            <div className="notification-settings">
                <ErrorNotice error={save.error} />

                <ChoiceList
                    name="new-tickets"
                    legend="Новые обращения"
                    options={NEW_TICKET_OPTIONS}
                    value={form.new_tickets}
                    onChange={(value) => {
                        setForm({ ...form, new_tickets: value as NewTickets });
                    }}
                />

                {form.new_tickets === 'topics' ? (
                    <fieldset className="notification-settings__topics">
                        <legend className="notification-settings__legend">Мои темы</legend>

                        {topics.map((topic) => (
                            <CheckboxField
                                key={topic.code}
                                name={`topic-${topic.code}`}
                                checked={form.topics.includes(topic.code)}
                                onChange={(on) => {
                                    toggleTopic(topic.code, on);
                                }}
                            >
                                {topic.label}
                            </CheckboxField>
                        ))}

                        {missingTopics ? (
                            <p className="notification-settings__hint">Выберите хотя бы одну тему.</p>
                        ) : null}
                    </fieldset>
                ) : null}

                <div className="notification-settings__max">
                    <CheckboxField
                        name="max-alerts"
                        checked={form.max_alerts}
                        onChange={(on) => {
                            setForm({ ...form, max_alerts: on });
                        }}
                    >
                        Дублировать в MAX
                    </CheckboxField>

                    <p className="notification-settings__hint notification-settings__hint--nested">
                        Бот пришлёт номер обращения и что случилось, без текста клиента.
                    </p>
                </div>

                <p className="notification-settings__hint">
                    Сообщения клиентов по вашим обращениям, передачи, оценки и предупреждения о сроках приходят всегда.
                </p>
            </div>
        </Modal>
    );
}
