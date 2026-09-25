import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { setSession } from '@/shared/api/http';
import { onSessionExpired } from '@/shared/api/session-events';
import { setViewport } from '@/shared/platform/max-bridge';
import type { Session } from '@/shared/types/api';

import { forgetLogin, login } from '../api/login';

const EXPIRED_MESSAGE =
    'Сессия истекла. Откройте приложение заново из MAX. Неотправленный черновик сохранён до закрытия окна.';

export function useSession(onUserChange: () => void) {
    const [session, setUser] = useState<Session | null>(null);
    const [error, setError] = useState<unknown>(null);
    const [loading, setLoading] = useState(true);
    const previousUser = useRef<string | null>(null);
    const cache = useQueryClient();

    const authenticate = useCallback(
        () =>
            login()
                .then((user) => {
                    if (previousUser.current && previousUser.current !== user.employee.id) {
                        onUserChange();
                    }

                    previousUser.current = user.employee.id;
                    setSession(user);
                    setUser(user);
                    void setViewport();
                })
                .catch(setError)
                .finally(() => {
                    setLoading(false);
                }),
        [onUserChange],
    );

    useEffect(() => {
        void authenticate();
    }, [authenticate]);

    useEffect(
        () =>
            onSessionExpired(() => {
                forgetLogin();
                setSession(null);
                setUser(null);
                setLoading(false);
                setError(new Error(EXPIRED_MESSAGE));
                cache.clear();
            }),
        [cache],
    );

    const retry = () => {
        forgetLogin();
        setLoading(true);
        setError(null);
        void authenticate();
    };

    return { session, error, loading, retry };
}
