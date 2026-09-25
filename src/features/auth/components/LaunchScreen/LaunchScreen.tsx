import { Button, Spinner } from '@maxhub/max-ui';

import { ErrorNotice } from '@/shared/ui';

import './LaunchScreen.scss';

type LaunchScreenProps = {
  loading: boolean;
  error: unknown;
  onRetry: () => void;
};

export function LaunchScreen({ loading, error, onRetry }: LaunchScreenProps) {
  if (loading) {
    return (
      <div className="launch-screen" aria-busy="true">
        <Spinner size={24} appearance="themed" />
        <p className="launch-screen__text">Проверяем доступ…</p>
      </div>
    );
  }
  return (
    <div className="launch-screen">
      <h1 className="launch-screen__title">Вход не выполнен</h1>
      {error ? (
        <ErrorNotice className="launch-screen__error" error={error} />
      ) : (
        <p className="launch-screen__text">
          Приложение доступно сотрудникам поддержки. Откройте его из MAX.
        </p>
      )}
      <Button size="small" onClick={onRetry}>
        Повторить вход
      </Button>
    </div>
  );
}
