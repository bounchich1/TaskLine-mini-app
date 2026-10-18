import { formText } from './form-data';
import type { BusinessProfile, GlossaryEntry, Tone } from './types';

export const TONE_OPTIONS: readonly { value: Tone; label: string; note: string }[] = [
    { value: 'formal', label: 'Деловой', note: 'Нейтрально и коротко, на «вы»' },
    { value: 'friendly', label: 'Дружелюбный', note: 'Теплее и проще, тоже на «вы»' },
];

export const PROFILE_LIMITS = { text: 500, rules: 8, rule: 120, glossary: 20, term: 40, meaning: 120 } as const;

const GLOSSARY_SEPARATOR = /\s+[—–-]\s+|:\s*/;

export function linesOf(text: string): string[] {
    return text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

export function glossaryText(glossary: readonly GlossaryEntry[]): string {
    return glossary.map(({ term, meaning }) => `${term} — ${meaning}`).join('\n');
}

function parseGlossary(text: string): { entries: GlossaryEntry[]; invalid: string | null } {
    const entries: GlossaryEntry[] = [];

    for (const line of linesOf(text)) {
        const [term = '', ...rest] = line.split(GLOSSARY_SEPARATOR);
        const meaning = rest.join(' — ').trim();

        if (!term.trim() || !meaning) {
            return { entries, invalid: line };
        }

        entries.push({ term: term.trim(), meaning });
    }

    return { entries, invalid: null };
}

export type ProfileDraft = Pick<BusinessProfile, 'description' | 'offerings' | 'tone' | 'rules' | 'glossary'>;

export function profilePayload(profile: BusinessProfile, changes: Partial<ProfileDraft>, configured = false) {
    const { description, offerings, tone, rules, glossary } = { ...profile, ...changes };

    return { description, offerings, tone, rules, glossary, configured: profile.configured || configured };
}

export function readToneForm(form: FormData): { draft: Partial<ProfileDraft>; error: string | null } {
    const rules = linesOf(formText(form, 'rules'));
    const glossary = parseGlossary(formText(form, 'glossary'));

    if (glossary.invalid !== null) {
        return {
            draft: {},
            error: `Глоссарий: в строке «${glossary.invalid}» нет значения. Формат: «термин — значение».`,
        };
    }

    if (rules.length > PROFILE_LIMITS.rules || rules.some((rule) => rule.length > PROFILE_LIMITS.rule)) {
        return {
            draft: {},
            error: `Правил — не больше ${PROFILE_LIMITS.rules}, каждое до ${PROFILE_LIMITS.rule} символов.`,
        };
    }

    if (glossary.entries.length > PROFILE_LIMITS.glossary) {
        return { draft: {}, error: `В глоссарии — не больше ${PROFILE_LIMITS.glossary} терминов.` };
    }

    return { draft: { tone: formText(form, 'tone') as Tone, rules, glossary: glossary.entries }, error: null };
}

export function readCompanyForm(form: FormData): Partial<ProfileDraft> {
    return { description: formText(form, 'description'), offerings: formText(form, 'offerings') };
}
