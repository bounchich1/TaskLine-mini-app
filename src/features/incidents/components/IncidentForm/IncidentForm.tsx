import { Button } from '@maxhub/max-ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useIncidentAction } from '@/features/incidents/hooks/use-incidents';
import { formText } from '@/features/incidents/model/form';
import { parseTerms, zonedInstant } from '@/features/incidents/model/format';
import { dictionariesQuery } from '@/shared/api/reference-data';
import type { IncidentDetail, IncidentLinkResult } from '@/shared/types/incidents';
import { CheckboxField, DictionarySelect, ErrorNotice, FormField, Modal } from '@/shared/ui';

import { CandidateList } from '../CandidateList/CandidateList';
import { EtaFields } from '../EtaFields/EtaFields';

import './IncidentForm.scss';

const LINKABLE = new Set(['open', 'in_progress']);
const MESSAGE_HINT = 'Его получат все связанные клиенты, а при автопривязке — каждый новый клиент сразу.';
const TERMS_HINT = 'Через запятую: улицы, адреса, характерные фразы. Обращения с ними привяжутся к инциденту.';

type IncidentFormProps = {
    suggestion?: IncidentDetail | null;
    ticketIds?: string[];
    timezone: string;
    onClose: () => void;
    onCreated: (id: string) => void;
};

type Defaults = { tag: string; title: string; message: string; terms: string };

function defaultsOf(suggestion: IncidentDetail | null | undefined): Defaults {
    if (!suggestion) {
        return { tag: '', title: '', message: '', terms: '' };
    }

    return {
        tag: suggestion.tag,
        title: suggestion.title,
        message: suggestion.public_message,
        terms: suggestion.match_terms.join(', '),
    };
}

function initialSelection(suggestion: IncidentDetail | null | undefined, ticketIds: string[]): Set<string> {
    if (!suggestion) {
        return new Set(ticketIds);
    }

    const usable = suggestion.candidates.filter((item) => LINKABLE.has(item.status) && !item.linked_elsewhere);

    return new Set(usable.filter((item) => item.in_cluster).map((item) => item.id));
}

type Draft = { tag: string; eta: string | null; ticketIds: string[]; suggestionId: string | undefined };

function payload(form: FormData, draft: Draft) {
    return {
        ...(draft.suggestionId ? { suggestion_id: draft.suggestionId } : {}),
        tag: draft.tag,
        title: formText(form, 'title'),
        public_message: formText(form, 'public_message'),
        match_terms: parseTerms(formText(form, 'match_terms')),
        request_rating: form.get('request_rating') === 'on',
        notify: form.get('notify') === 'on',
        eta: draft.eta,
        ticket_ids: draft.ticketIds,
    };
}

export function IncidentForm({ suggestion, ticketIds = [], timezone, onClose, onCreated }: IncidentFormProps) {
    const dictionaries = useQuery(dictionariesQuery);
    const [defaults] = useState(() => defaultsOf(suggestion));
    const [tag, setTag] = useState(defaults.tag);
    const [selected, setSelected] = useState(() => initialSelection(suggestion, ticketIds));
    const [eta, setEta] = useState({ day: '', time: '' });

    const create = useIncidentAction<IncidentLinkResult>((result) => {
        onCreated(result.incident.id);
    });

    const submit = (form: FormData) => {
        const draft = {
            tag,
            eta: zonedInstant(eta.day, eta.time, timezone),
            ticketIds: [...selected],
            suggestionId: suggestion?.id,
        };

        create.mutate({ path: '/v1/incidents', body: payload(form, draft) });
    };

    return (
        <Modal
            title={suggestion ? 'Создать инцидент по подсказке' : 'Новый инцидент'}
            onClose={onClose}
            busy={create.isPending}
            wide
            footer={
                <Button form="incident-form" type="submit" size="small" loading={create.isPending} disabled={!tag}>
                    Создать инцидент
                </Button>
            }
        >
            <ErrorNotice error={create.error} />

            <form
                id="incident-form"
                className="incident-form"
                onSubmit={(event) => {
                    event.preventDefault();
                    submit(new FormData(event.currentTarget));
                }}
            >
                <FormField label="Название">
                    <input name="title" required maxLength={120} defaultValue={defaults.title} />
                </FormField>

                <FormField label="Тема">
                    <DictionarySelect
                        aria-label="Тема инцидента"
                        placeholder="Выберите тему"
                        items={dictionaries.data?.items}
                        dimension="tag"
                        activeOnly
                        value={tag}
                        onChange={setTag}
                    />
                </FormField>

                <FormField label="Сообщение для клиентов" hint={MESSAGE_HINT}>
                    <textarea name="public_message" rows={3} maxLength={2000} defaultValue={defaults.message} />
                </FormField>

                <FormField label="Слова для автопривязки" hint={TERMS_HINT}>
                    <input name="match_terms" defaultValue={defaults.terms} />
                </FormField>

                <EtaFields value={eta} onChange={setEta} />

                <div className="incident-form__options">
                    <CheckboxField name="notify" defaultChecked>
                        Сразу отправить сообщение связанным клиентам
                    </CheckboxField>

                    <CheckboxField name="request_rating">Просить оценку при закрытии обращений</CheckboxField>
                </div>

                {suggestion ? (
                    <CandidateList candidates={suggestion.candidates} selected={selected} onChange={setSelected} />
                ) : (
                    <p className="incident-form__linked">
                        {selected.size
                            ? `Будет связано обращений: ${selected.size}`
                            : 'Обращения можно связать позже — из очереди или по автопривязке.'}
                    </p>
                )}
            </form>
        </Modal>
    );
}
