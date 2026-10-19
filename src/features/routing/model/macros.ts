import type { Macro, MacroActions } from '@/shared/types/routing';

export type MacroContext = { ticketNumber: string; agentName: string; eta: string };

export const MACRO_VARIABLES = '{ticket_number} — номер обращения, {agent_name} — ваше имя, {eta} — срок решения';

export function renderMacro(body: string, context: MacroContext): string {
    return body
        .replaceAll('{ticket_number}', context.ticketNumber)
        .replaceAll('{agent_name}', context.agentName)
        .replaceAll('{eta}', context.eta);
}

export type MacroFollowUp = 'none' | 'wait' | 'close';

export function followUpOf(actions: MacroActions): MacroFollowUp {
    if (actions.close) {
        return 'close';
    }

    return actions.wait ? 'wait' : 'none';
}

export function macroPayload(form: FormData, shared: boolean) {
    const text = (name: string) => {
        const value = form.get(name);

        return typeof value === 'string' ? value.trim() : '';
    };

    const followUp = text('follow_up') as MacroFollowUp;

    const actions: MacroActions = Object.fromEntries(
        (['tag', 'urgency', 'complexity'] as const).flatMap((field) => (text(field) ? [[field, text(field)]] : [])),
    );

    if (followUp !== 'none') {
        actions[followUp] = true;
    }

    return { title: text('title'), body: text('body'), actions, shared };
}

export function matchMacros(macros: Macro[], query: string): Macro[] {
    const needle = query.trim().toLowerCase();

    return macros.filter((macro) => !needle || macro.title.toLowerCase().includes(needle)).slice(0, 8);
}

export function describeActions(actions: MacroActions, labels: (dimension: string, code: string) => string): string {
    const parts = (['tag', 'urgency', 'complexity'] as const).flatMap((field) =>
        actions[field] ? [labels(field, actions[field])] : [],
    );

    if (actions.wait) {
        parts.push('ждём клиента');
    }

    if (actions.close) {
        parts.push('закрыть');
    }

    return parts.join(' · ');
}
