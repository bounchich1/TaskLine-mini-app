import { clsx } from 'clsx';

import { Icon } from '../Icon/Icon';

import './ErrorNotice.scss';

type ErrorNoticeProps = {
  error: unknown;
  className?: string;
};

export function ErrorNotice({ error, className }: ErrorNoticeProps) {
  if (!error) {
    return null;
  }
  return (
    <div className={clsx('error-notice', className)} role="alert">
      <Icon className="error-notice__icon" name="alert" size={16} />
      {error instanceof Error ? error.message : 'Не удалось загрузить данные.'}
    </div>
  );
}
