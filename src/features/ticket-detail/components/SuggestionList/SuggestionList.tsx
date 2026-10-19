import { clsx } from 'clsx';

import type { ComposerSuggest } from '@/features/ticket-detail/hooks/use-composer-suggest';

import './SuggestionList.scss';

type SuggestionListProps = { suggest: ComposerSuggest; onChoose: (position: number) => void };

export function SuggestionList({ suggest, onChoose }: SuggestionListProps) {
    if (!suggest.open) {
        return null;
    }

    return (
        <ul
            className="suggestion-list"
            role="listbox"
            aria-label={suggest.kind === 'macro' ? 'Шаблоны ответов' : 'Сотрудники'}
        >
            {suggest.items.map((item, index) => (
                <li key={item.id} role="option" aria-selected={index === suggest.active}>
                    <button
                        type="button"
                        tabIndex={-1}
                        className={clsx(
                            'suggestion-list__item',
                            index === suggest.active && 'suggestion-list__item--active',
                        )}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            onChoose(suggest.choose(item));
                        }}
                    >
                        <span className="suggestion-list__title">{item.title}</span>
                        {item.detail ? <span className="suggestion-list__detail">{item.detail}</span> : null}
                    </button>
                </li>
            ))}
        </ul>
    );
}
