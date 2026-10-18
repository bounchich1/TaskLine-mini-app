import { previewText, showsMenu } from '@/features/admin/model/template-catalog';
import type { BotSettings } from '@/features/admin/model/types';

const FALLBACK_MENU = { tickets: 'Мои обращения', help: 'Помощь', withdraw: 'Отозвать согласие' };

export function TemplatePreview({ text, code, bot }: { text: string; code: string; bot: BotSettings | undefined }) {
    const menu = bot?.menu ?? FALLBACK_MENU;

    const shown = previewText(text, {
        policyUrl: bot?.policy_url ?? 'https://example.ru/privacy',
        alternativeContact: bot?.alternative_contact ?? 'Телефон поддержки',
        menu,
    });

    return (
        <div className="template-preview" aria-label="Так увидит клиент">
            <p className="template-preview__bubble">{shown || ' '}</p>

            {showsMenu(code) ? (
                <div className="template-preview__buttons" aria-hidden="true">
                    <span>{menu.tickets}</span>
                    <span>{menu.help}</span>
                    <span>{menu.withdraw}</span>
                </div>
            ) : null}
        </div>
    );
}
