import { Button } from '@maxhub/max-ui';

import { customerReply, isTerse } from '@/features/ticket-detail/model/suggestion';
import type { Suggestion, SuggestionSource } from '@/shared/types/api';

import { SourceList } from '../SourceList/SourceList';
import { TipContent } from '../TipContent/TipContent';

type SuggestionAdviceProps = {
    suggestion: Suggestion;
    sources: SuggestionSource[];
    canInsert: boolean;
    onInsert: (text: string) => void;
    onSource: (memoryId: string) => void;
};

export function SuggestionAdvice({ suggestion, sources, canInsert, onInsert, onSource }: SuggestionAdviceProps) {
    const reply = customerReply(suggestion);
    const terse = isTerse(suggestion);
    const tip = terse ? suggestion.tip : null;

    return (
        <>
            {tip ? <TipContent tip={tip} sources={sources} onSource={onSource} /> : null}
            {terse ? null : <p className="ai-panel__text">{reply}</p>}

            {suggestion.missing_information.length > 0 ? (
                <div className="ai-panel__missing">
                    <span className="ai-panel__missing-title">Уточнить у клиента</span>

                    <ul className="ai-panel__missing-list">
                        {suggestion.missing_information.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {terse && reply ? (
                <details className="ai-panel__reply">
                    <summary>Черновик ответа клиенту</summary>
                    <p className="ai-panel__text">{reply}</p>
                </details>
            ) : null}

            <div className="ai-panel__footer">
                {reply ? (
                    <Button
                        variant="secondary"
                        size="xsmall"
                        disabled={!canInsert}
                        onClick={() => {
                            onInsert(reply);
                        }}
                    >
                        Вставить в черновик
                    </Button>
                ) : null}

                <SourceList sources={sources} onSource={onSource} />
            </div>
        </>
    );
}
