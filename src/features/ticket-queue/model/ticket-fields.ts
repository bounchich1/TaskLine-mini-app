import type { Ticket } from '@/shared/types/api';

/** Shown instead of the tag, urgency and complexity while the assistant classifies the ticket. */
const CLASSIFYING = 'Определяется';

/** While the assistant classifies a new ticket its labels are not known yet. */
export const isClassifying = (ticket: Ticket) => ticket.ai_status === 'pending';

export const tagText = (ticket: Ticket) => (isClassifying(ticket) ? CLASSIFYING : ticket.tag_label);

export const urgencyText = (ticket: Ticket) =>
  isClassifying(ticket) ? CLASSIFYING : ticket.urgency_label;

export const complexityText = (ticket: Ticket) =>
  isClassifying(ticket) ? CLASSIFYING : ticket.complexity_label;

/** "9 / 10", or why there is no rating yet. */
export function ratingText(ticket: Ticket) {
  if (ticket.rating) {
    return `${ticket.rating} / 10`;
  }
  return ticket.status === 'awaiting_rating' ? 'Ожидается' : 'Без оценки';
}
