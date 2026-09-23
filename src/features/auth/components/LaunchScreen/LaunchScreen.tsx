import { Button } from '@maxhub/max-ui';

import { ErrorNotice, Icon } from '@/shared/ui';

type LaunchScreenProps = {
  loading: boolean;
  error: unknown;
  onRetry: () => void;
};

/** Shown until the employee is signed in: progress, then the sign-in error and a retry. */
export function LaunchScreen({ loading, error, onRetry }: LaunchScreenProps) {
  return (
    <div className="launch">
      <div className="brand-mark">
        <Icon name="inbox" size={32} />
      </div>
      <span className="eyebrow">MAX / ПОДДЕРЖКА</span>
      <h1>{loading ? 'Проверяем доступ' : 'Рабочее место поддержки'}</h1>
      <p>
        {loading
          ? 'Подключаем вашу учётную запись…'
          : 'Обращения, команда и знания — в одном месте.'}
      </p>
      <ErrorNotice error={error} />
      {loading ? null : <Button onClick={onRetry}>Повторить вход</Button>}
      <span className="launch-foot">Только для сотрудников организации</span>
    </div>
  );
}
