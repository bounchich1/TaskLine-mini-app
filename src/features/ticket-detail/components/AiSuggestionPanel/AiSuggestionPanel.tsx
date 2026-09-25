import type { Ticket } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

import { AiSuggestionBody } from '../AiSuggestionBody/AiSuggestionBody';

import './AiSuggestionPanel.scss';

type AiSuggestionPanelProps = {
  ticket: Ticket;
  /** Inserting into the draft is allowed. */
  canInsert: boolean;
  onInsert: (text: string) => void;
};

/** The assistant's suggested solution: visible to staff only, never sent on its own. */
export function AiSuggestionPanel(props: AiSuggestionPanelProps) {
  return (
    <div className="ai-panel">
      <h3 className="ai-panel__title">
        <Icon name="spark" size={16} />
        Подсказка
        <span className="ai-panel__private">видна только сотрудникам</span>
      </h3>
      <AiSuggestionBody {...props} />
    </div>
  );
}
