import type { TicketPage } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

import './SummaryCards.scss';

/** Open and closed totals above the queue. */
export function SummaryCards({ counts }: { counts: TicketPage['counts'] | undefined }) {
  return (
    <div className="summary-cards">
      <div className="summary-cards__card">
        <span className="summary-cards__icon summary-cards__icon--teal">
          <Icon className="summary-cards__glyph" name="inbox" />
        </span>
        <div>
          <span className="summary-cards__label">В открытой очереди</span>
          <strong className="summary-cards__value">{counts?.open ?? '—'}</strong>
        </div>
        <span className="summary-cards__caption">ждут решения</span>
      </div>
      <div className="summary-cards__card">
        <span className="summary-cards__icon summary-cards__icon--blue">
          <Icon className="summary-cards__glyph" name="check" />
        </span>
        <div>
          <span className="summary-cards__label">Закрытые обращения</span>
          <strong className="summary-cards__value">{counts?.closed ?? '—'}</strong>
        </div>
        <span className="summary-cards__caption">с историей оценок</span>
      </div>
      <div className="summary-cards__card summary-cards__card--note">
        <Icon name="spark" size={22} />
        <p className="summary-cards__note-text">
          ИИ помогает с решением.
          <br />
          <strong className="summary-cards__note-emphasis">Последнее слово — за вами.</strong>
        </p>
      </div>
    </div>
  );
}
