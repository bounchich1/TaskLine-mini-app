import type { Suggestion, SuggestionSource, TerseSuggestion } from '@/shared/types/api';

export function isTerse(suggestion: Suggestion): suggestion is TerseSuggestion {
    return suggestion.schema_version === '1.1';
}

export function customerReply(suggestion: Suggestion): string | null {
    return isTerse(suggestion) ? suggestion.customer_reply : suggestion.suggested_solution;
}

export function hasAdvice(suggestion: Suggestion | null): suggestion is Suggestion {
    if (!suggestion) {
        return false;
    }

    return isTerse(suggestion)
        ? Boolean(suggestion.tip ?? suggestion.customer_reply)
        : Boolean(suggestion.suggested_solution);
}

export function sourceHint(source: SuggestionSource): string {
    if (source.state === 'reopened') {
        return 'Обращение переоткрывали — решение могло не помочь';
    }

    if (source.state === 'outdated') {
        return 'Переписка менялась после закрытия';
    }

    return source.problem ?? 'Похожее закрытое обращение';
}
