import { Button } from '@maxhub/max-ui';

import type { Diagnostic, Resolution } from '@/features/admin/model/types';

export function ResolveButtons({ item, onResolve }: { item: Diagnostic; onResolve: (resolution: Resolution) => void }) {
    return (
        <>
            <Button
                size="xsmall"
                variant="secondary"
                onClick={() => {
                    onResolve({ item, action: 'cancel' });
                }}
            >
                Не повторять
            </Button>

            <Button
                size="xsmall"
                variant="secondary"
                onClick={() => {
                    onResolve({ item, action: 'retry' });
                }}
            >
                Повторить
            </Button>
        </>
    );
}
