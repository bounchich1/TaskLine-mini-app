import './ErrorNotice.scss';

/** Shows an error's message; renders nothing when `error` is empty. */
export function ErrorNotice({ error }: { error: unknown }) {
  if (!error) {
    return null;
  }
  return (
    <div className="error-notice" role="alert">
      {error instanceof Error ? error.message : 'Не удалось загрузить данные.'}
    </div>
  );
}
