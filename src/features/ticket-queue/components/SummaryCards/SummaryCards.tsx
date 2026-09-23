import type { TicketPage } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

/** Open and closed totals above the queue. */
export function SummaryCards({ counts }: { counts: TicketPage['counts'] | undefined }) {
  return (
    <div className="summary-grid">
      <div className="summary-card">
        <span className="summary-icon teal">
          <Icon name="inbox" />
        </span>
        <div>
          <span>В открытой очереди</span>
          <strong>{counts?.open ?? '—'}</strong>
        </div>
        <span className="summary-caption">ждут решения</span>
      </div>
      <div className="summary-card">
        <span className="summary-icon blue">
          <Icon name="check" />
        </span>
        <div>
          <span>Закрытые обращения</span>
          <strong>{counts?.closed ?? '—'}</strong>
        </div>
        <span className="summary-caption">с историей оценок</span>
      </div>
      <div className="summary-card small-note">
        <Icon name="spark" size={22} />
        <p>
          ИИ помогает с решением.
          <br />
          <strong>Последнее слово — за вами.</strong>
        </p>
      </div>
    </div>
  );
}
