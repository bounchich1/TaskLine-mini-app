import { Button } from '@maxhub/max-ui';

import './SetupCard.scss';

type SetupCardProps = { onStart: () => void };

export function SetupCard({ onStart }: SetupCardProps) {
    return (
        <section className="setup-card" aria-labelledby="setup-card-title">
            <div className="setup-card__text">
                <h2 className="setup-card__title" id="setup-card-title">
                    Настройте бота под свой бизнес
                </h2>

                <p className="setup-card__body">
                    Сфера, темы обращений, описание компании и тон ответов — 5 коротких шагов. ИИ начнёт точнее
                    определять тему и готовить ответы.
                </p>
            </div>

            <Button size="small" onClick={onStart}>
                Начать
            </Button>
        </section>
    );
}
