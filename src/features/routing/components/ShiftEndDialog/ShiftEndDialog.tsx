import { Button } from '@maxhub/max-ui';

import type { PresenceState } from '@/features/routing/hooks/use-presence';
import { plural } from '@/shared/lib/plural';
import { ErrorNotice, Modal } from '@/shared/ui';

type ShiftEndDialogProps = { state: PresenceState };

export function ShiftEndDialog({ state }: ShiftEndDialogProps) {
    const { active, release } = state;
    const tickets = plural(active, ['обращение', 'обращения', 'обращений']);

    return (
        <Modal
            title="Смена закончена?"
            onClose={state.keep}
            busy={release.isPending}
            cancelLabel="Оставить за мной"
            footer={
                <Button
                    size="small"
                    loading={release.isPending}
                    onClick={() => {
                        release.mutate();
                    }}
                >
                    Вернуть в очередь
                </Button>
            }
        >
            <p>
                У вас в работе {active} {tickets}. Верните их в очередь, чтобы ими занялись коллеги на линии, или
                оставьте за собой — клиенты будут ждать вашего ответа.
            </p>

            <ErrorNotice error={release.error} />
        </Modal>
    );
}
