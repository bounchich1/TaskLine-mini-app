import type { SuggestionSource, Tip } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

import { SourceChip } from '../SourceChip/SourceChip';

import './TipContent.scss';

type TipContentProps = {
    tip: Tip;
    sources: SuggestionSource[];
    onSource: (memoryId: string) => void;
};

export function TipContent({ tip, sources, onSource }: TipContentProps) {
    const chipsFor = (refs: string[]) =>
        sources
            .filter((source) => refs.includes(source.memory_id))
            .map((source) => <SourceChip key={source.memory_id} source={source} onOpen={onSource} />);

    return (
        <div className="tip">
            <p className="tip__summary">{tip.summary}</p>

            {tip.steps.length ? (
                <ol className="tip__steps">
                    {tip.steps.map((step) => (
                        <li className="tip__step" key={step.text}>
                            <span>{step.text}</span>
                            {chipsFor(step.case_refs)}
                        </li>
                    ))}
                </ol>
            ) : null}

            {tip.cautions.length ? (
                <ul className="tip__cautions" aria-label="Предостережения">
                    {tip.cautions.map((caution) => (
                        <li className="tip__caution" key={caution}>
                            <Icon name="alert" size={14} />
                            {caution}
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
