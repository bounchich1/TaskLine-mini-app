import type { Message } from '@/shared/types/api';

const UNRESOLVED_DELIVERIES = ['queued', 'sending', 'retry_wait', 'unknown'];

export const CANCELABLE_DELIVERIES = ['queued', 'retry_wait', 'failed'];

export const sortMessages = (pages: { items: Message[] }[] | undefined): Message[] =>
  pages?.flatMap((page) => page.items).sort((left, right) => left.seq - right.seq) ?? [];

export const hasUnresolvedDelivery = (messages: Message[]) =>
  messages.some(
    (message) =>
      message.author_type === 'staff' && UNRESOLVED_DELIVERIES.includes(message.delivery_state),
  );
