import { Button } from '@maxhub/max-ui';

import { Modal } from '@/shared/ui';

export type PolicyDraft = { policy_url: string; alternative_contact: string; edition: boolean };

export function EditionQuestion({
    draft,
    busy,
    onSave,
    onClose,
}: {
    draft: PolicyDraft;
    busy: boolean;
    onSave: (newEdition: boolean) => void;
    onClose: () => void;
}) {
    return (
        <Modal
            title={draft.edition ? 'Опубликовать новую редакцию?' : 'Ссылка на политику изменилась'}
            onClose={onClose}
            busy={busy}
            footer={
                <>
                    {draft.edition ? null : (
                        <Button
                            variant="secondary"
                            size="small"
                            disabled={busy}
                            onClick={() => {
                                onSave(false);
                            }}
                        >
                            Документ тот же
                        </Button>
                    )}

                    <Button
                        size="small"
                        loading={busy}
                        onClick={() => {
                            onSave(true);
                        }}
                    >
                        Новая редакция
                    </Button>
                </>
            }
        >
            <p>
                {draft.edition ? null : 'Это новая редакция документа? '}
                Клиенты без открытого обращения увидят запрос согласия при следующем сообщении. Если изменился только
                адрес, а документ тот же, согласие повторно не запрашивается.
            </p>
        </Modal>
    );
}
