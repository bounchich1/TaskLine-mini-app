import { clsx } from 'clsx';

import type { DraftMode } from '@/features/ticket-detail/model/draft';

import './ComposerModes.scss';

const MODES: readonly { mode: DraftMode; label: string; title: string }[] = [
    { mode: 'reply', label: 'Ответ клиенту', title: 'R' },
    { mode: 'note', label: 'Заметка', title: 'N — видна только сотрудникам' },
];

type ComposerModesProps = { mode: DraftMode; onMode: (mode: DraftMode) => void };

export function ComposerModes({ mode, onMode }: ComposerModesProps) {
    return (
        <div className="composer-modes" role="tablist" aria-label="Что написать">
            {MODES.map((item) => (
                <button
                    key={item.mode}
                    type="button"
                    role="tab"
                    title={item.title}
                    aria-selected={mode === item.mode}
                    className={clsx('composer-modes__tab', mode === item.mode && `composer-modes__tab--${item.mode}`)}
                    onClick={() => {
                        onMode(item.mode);
                    }}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
