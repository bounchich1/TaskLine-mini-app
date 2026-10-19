import type { Dispatch, KeyboardEvent, RefObject, SetStateAction } from 'react';

import type { ComposerSuggest } from '@/features/ticket-detail/hooks/use-composer-suggest';
import { withText, type Draft } from '@/features/ticket-detail/model/draft';
import { MAX_REPLY_LENGTH } from '@/features/ticket-detail/model/limits';

import { SuggestionList } from '../SuggestionList/SuggestionList';

type ComposerInputProps = {
    inputRef: RefObject<HTMLTextAreaElement | null>;
    draft: Draft;
    setDraft: Dispatch<SetStateAction<Draft>>;
    suggest: ComposerSuggest;
    locked: boolean;
    pending: boolean;
    onTyping: () => void;
    onSubmit: () => void;
};

const PLACEHOLDERS = {
    reply: 'Ответ клиенту от имени бота · «/» — шаблоны',
    note: 'Заметка для коллег · «@» — упомянуть сотрудника',
};

export function ComposerInput(props: ComposerInputProps) {
    const { inputRef, draft, setDraft, suggest, locked, pending } = props;

    const moveCaret = (position: number) => {
        requestAnimationFrame(() => {
            inputRef.current?.setSelectionRange(position, position);
            suggest.trackCaret(position);
        });
    };

    const keyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (suggest.onKeyDown(event, moveCaret)) {
            return;
        }

        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            props.onSubmit();
        }
    };

    return (
        <div className="composer__field">
            <SuggestionList suggest={suggest} onChoose={moveCaret} />

            <textarea
                ref={inputRef}
                className="composer__input"
                aria-label={draft.mode === 'note' ? 'Текст заметки для сотрудников' : 'Текст ответа клиенту'}
                placeholder={locked ? 'Отправка недоступна' : PLACEHOLDERS[draft.mode]}
                value={draft.text}
                onChange={(event) => {
                    setDraft(withText(event.target.value));
                    suggest.trackCaret(event.target.selectionStart);
                    props.onTyping();
                }}
                onSelect={(event) => {
                    suggest.trackCaret(event.currentTarget.selectionStart);
                }}
                onKeyDown={keyDown}
                maxLength={MAX_REPLY_LENGTH}
                rows={3}
                readOnly={locked}
                disabled={pending}
            />
        </div>
    );
}
