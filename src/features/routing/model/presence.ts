import type { Presence } from '@/shared/types/routing';

export const PRESENCE_OPTIONS: readonly { value: Presence; label: string; hint: string }[] = [
    { value: 'online', label: 'На линии', hint: 'Получаю новые обращения' },
    { value: 'break', label: 'Перерыв', hint: 'Новые обращения не предлагаются' },
    { value: 'offline', label: 'Не в сети', hint: 'Смена закончена' },
];

export const presenceLabel = (presence: Presence) =>
    PRESENCE_OPTIONS.find((option) => option.value === presence)?.label ?? presence;
