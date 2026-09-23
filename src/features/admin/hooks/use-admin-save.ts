import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { api, type ApiOptions } from '@/shared/api/http';

/**
 * Sends an admin change, refetches everything and calls `onSaved` (which closes the dialogs).
 * A failure is kept in `error` for the open dialog to show.
 */
export function useAdminSave(onSaved: () => void) {
  const cache = useQueryClient();
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const save = async (path: string, options: ApiOptions) => {
    setBusy(true);
    setError(null);
    try {
      await api(path, options);
      await cache.invalidateQueries();
      onSaved();
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  };
  return { save, busy, error, setError };
}

export type AdminSave = ReturnType<typeof useAdminSave>['save'];
