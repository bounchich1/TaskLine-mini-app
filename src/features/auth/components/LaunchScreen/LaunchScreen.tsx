import { Button } from '@maxhub/max-ui';

import { ErrorNotice, Icon } from '@/shared/ui';

import './LaunchScreen.scss';

type LaunchScreenProps = {
  loading: boolean;
  error: unknown;
  onRetry: () => void;
};

/** Shown until the employee is signed in: progress, then the sign-in error and a retry. */
export function LaunchScreen({ loading, error, onRetry }: LaunchScreenProps) {
  return (
    <div className="launch-screen">
      <div className="launch-screen__mark">
        <Icon name="inbox" size={32} />
      </div>
      <span className="launch-screen__eyebrow">MAX / ПОДДЕРЖКА</span>
      <h1 className="launch-screen__title">
        {loading ? 'Проверяем доступ' : 'Рабочее место поддержки'}
      </h1>
      <p className="launch-screen__text">
        {loading
          ? 'Подключаем вашу учётную запись…'
          : 'Обращения, команда и знания — в одном месте.'}
      </p>
      <ErrorNotice error={error} />
      {loading ? null : <Button onClick={onRetry}>Повторить вход</Button>}
      <span className="launch-screen__foot">Только для сотрудников организации</span>
    </div>
  );
}
