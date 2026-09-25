import type { Ticket } from '@/shared/types/api';

const CLASSIFYING = 'Определяется';

export const isClassifying = (ticket: Ticket) => ticket.ai_status === 'pending';

export const tagText = (ticket: Ticket) => (isClassifying(ticket) ? CLASSIFYING : ticket.tag_label);

export const urgencyText = (ticket: Ticket) =>
  isClassifying(ticket) ? CLASSIFYING : ticket.urgency_label;

export const complexityText = (ticket: Ticket) =>
  isClassifying(ticket) ? CLASSIFYING : ticket.complexity_label;

export function ratingText(ticket: Ticket) {
  if (ticket.rating) {
    return `${ticket.rating} / 10`;
  }
  return ticket.status === 'awaiting_rating' ? 'Ожидается' : 'Без оценки';
}
