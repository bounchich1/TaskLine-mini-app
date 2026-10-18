import { Spinner } from '@maxhub/max-ui';

import { useNotificationSettings } from '@/features/notifications/hooks/use-notifications';
import { ErrorNotice, Modal } from '@/shared/ui';

import { NotificationSettingsForm } from './NotificationSettingsForm';

import './NotificationSettingsDialog.scss';

export function NotificationSettingsDialog({ onClose }: { onClose: () => void }) {
    const settings = useNotificationSettings();

    if (!settings.data) {
        return (
            <Modal title="Настройки уведомлений" onClose={onClose}>
                <ErrorNotice error={settings.error} />
                {settings.error ? null : <Spinner size={24} />}
            </Modal>
        );
    }

    return <NotificationSettingsForm initial={settings.data} onClose={onClose} />;
}
