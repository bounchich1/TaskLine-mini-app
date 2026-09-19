import { useState, type FormEvent } from 'react';
import { Button } from '@maxhub/max-ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { Empty, ErrorNotice, Icon, Modal, date } from './ui';
import type { Dictionary, Employee, Session } from './types';
type Template = { code: string; body: string; version: number };
type Diagnostic = {
  id: string;
  ticket_id?: string;
  message_id?: string;
  kind?: string;
  state: string;
  reason?: string;
  created_at?: string;
  eligible?: boolean;
};
export function AdminPanel({
  session,
  onTicket,
}: {
  session: Session;
  onTicket: (id: string) => void;
}) {
  const cache = useQueryClient();
  const isAdmin = session.capabilities.admin;
  const [tab, setTab] = useState(isAdmin ? 'employees' : 'diagnostics');
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Employee | null | undefined>(undefined);
  const [dictionary, setDictionary] = useState<Dictionary | null | undefined>(undefined);
  const [template, setTemplate] = useState<Template | null>(null);
  const [resolution, setResolution] = useState<{
    item: Diagnostic;
    action: 'cancel' | 'retry';
  } | null>(null);
  const [evidence, setEvidence] = useState('');
  const employees = useQuery({
    queryKey: ['admin-employees'],
    queryFn: () => api<{ items: Employee[] }>('/v1/admin/employees'),
    enabled: isAdmin && tab === 'employees',
  });
  const dictionaries = useQuery({
    queryKey: ['dictionaries'],
    queryFn: () => api<{ items: Dictionary[] }>('/v1/dictionaries'),
    enabled: tab === 'dictionaries',
  });
  const templates = useQuery({
    queryKey: ['admin-templates'],
    queryFn: () => api<{ items: Template[] }>('/v1/admin/templates'),
    enabled: isAdmin && tab === 'templates',
  });
  const settings = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api<{ name: string; timezone: string; version: number }>('/v1/admin/settings'),
    enabled: isAdmin && tab === 'settings',
  });
  const diagnostics = useQuery({
    queryKey: ['diagnostics'],
    queryFn: () =>
      api<{
        jobs: Diagnostic[];
        deliveries: Diagnostic[];
        memory: Diagnostic[];
        permits: { slot: number; state: string }[];
      }>('/v1/admin/diagnostics'),
    enabled: tab === 'diagnostics',
    refetchInterval: 15000,
  });
  const audit = useQuery({
    queryKey: ['audit'],
    queryFn: () =>
      api<{ items: { id: string; action: string; object_id: string; created_at: string }[] }>(
        '/v1/admin/audit',
      ),
    enabled: isAdmin && tab === 'audit',
  });
  async function save(path: string, method: string, body: unknown, version?: number) {
    setBusy(true);
    setError(null);
    try {
      await api(path, { method, body, version });
      await cache.invalidateQueries();
      setEditing(undefined);
      setDictionary(undefined);
      setTemplate(null);
      setResolution(null);
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  const tabs = isAdmin
    ? [
        ['employees', 'Сотрудники'],
        ['dictionaries', 'Справочники'],
        ['templates', 'Шаблоны бота'],
        ['settings', 'Организация'],
        ['diagnostics', 'Состояние системы'],
        ['audit', 'Журнал'],
      ]
    : [['diagnostics', 'Состояние системы']];
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">КОМАНДА И НАСТРОЙКИ</span>
          <h1>
            Управление<span className="title-dot">.</span>
          </h1>
          <p>Доступ, правила обработки и состояние отправок.</p>
        </div>
      </div>
      <div className="admin-tabs" role="tablist" aria-label="Управление">
        {tabs.map(([value, label]) => (
          <button
            role="tab"
            aria-selected={tab === value}
            className={tab === value ? 'selected' : ''}
            key={value}
            onClick={() => {
              setTab(value);
              setError(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <ErrorNotice error={error} />
      <ErrorNotice
        error={
          employees.error ||
          dictionaries.error ||
          templates.error ||
          settings.error ||
          diagnostics.error ||
          audit.error
        }
      />
      {tab === 'employees' && (
        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Сотрудники</h2>
            <Button size="small" onClick={() => setEditing(null)}>
              Добавить сотрудника
            </Button>
          </div>
          <div className="admin-list">
            {employees.data?.items.map((employee) => (
              <div className="admin-row" key={employee.id}>
                <span className="avatar-small">{employee.name[0]}</span>
                <div>
                  <strong>{employee.name}</strong>
                  <small>
                    MAX ID: {employee.max_user_id} ·{' '}
                    {employee.role === 'admin'
                      ? 'Администратор'
                      : employee.role === 'supervisor'
                        ? 'Руководитель'
                        : 'Поддержка'}
                  </small>
                </div>
                <span
                  className={`badge ${employee.blocked ? 'status-closed' : 'status-in_progress'}`}
                >
                  {employee.blocked ? 'Заблокирован' : 'Активен'}
                </span>
                <Button variant="ghost" size="small" onClick={() => setEditing(employee)}>
                  Изменить
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
      {tab === 'dictionaries' && (
        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Справочники классификации</h2>
            <Button size="small" onClick={() => setDictionary(null)}>
              Добавить значение
            </Button>
          </div>
          <p className="admin-help">
            Коды остаются неизменными. Архивные значения сохраняются в истории обращений.
          </p>
          {(['tag', 'urgency', 'complexity'] as const).map((d) => (
            <div className="dictionary-group" key={d}>
              <h3>{d === 'tag' ? 'Теги' : d === 'urgency' ? 'Срочность' : 'Сложность'}</h3>
              {dictionaries.data?.items
                .filter((v) => v.dimension === d)
                .map((value) => (
                  <div className="admin-row" key={value.code}>
                    <div>
                      <strong>{value.label}</strong>
                      <small>
                        {value.code} · приоритет {value.rank} · версия {value.version}
                      </small>
                    </div>
                    <span className="muted">{value.active ? 'Используется' : 'В архиве'}</span>
                    <Button variant="ghost" size="small" onClick={() => setDictionary(value)}>
                      Изменить
                    </Button>
                  </div>
                ))}
            </div>
          ))}
        </section>
      )}
      {tab === 'templates' && (
        <section className="admin-card">
          <div className="admin-card-head">
            <h2>Сообщения бота</h2>
          </div>
          <p className="admin-help">
            Подстановки: {'{ticket_number}'}, {'{policy_url}'}, {'{alternative_contact}'}. Личные
            данные сотрудников клиентам не передаются.
          </p>
          {templates.data?.items.map((item) => (
            <div className="template-row" key={item.code}>
              <div>
                <strong>{item.code}</strong>
                <small>Версия {item.version}</small>
                <p>{item.body}</p>
              </div>
              <Button variant="ghost" size="small" onClick={() => setTemplate(item)}>
                Изменить
              </Button>
            </div>
          ))}
        </section>
      )}
      {tab === 'settings' && settings.data && (
        <section className="admin-card">
          <h2>Организация</h2>
          <form
            className="settings-form"
            key={settings.data.version}
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              void save(
                '/v1/admin/settings',
                'PUT',
                { name: form.get('name'), timezone: form.get('timezone') },
                settings.data!.version,
              );
            }}
          >
            <label className="form-field">
              Название
              <input name="name" defaultValue={settings.data.name} maxLength={120} required />
            </label>
            <label className="form-field">
              Часовой пояс
              <input name="timezone" defaultValue={settings.data.timezone} required />
            </label>
            <p className="admin-help">
              Политика согласия, ключи сервисов и ограничения ИИ настраиваются при развёртывании
              сервера.
            </p>
            <Button type="submit" loading={busy}>
              Сохранить
            </Button>
          </form>
        </section>
      )}
      {tab === 'diagnostics' && (
        <>
          <section className="admin-card">
            <h2>Вызовы ИИ</h2>
            <div className="permit-grid">
              {diagnostics.data?.permits.map((p) => (
                <div className={`permit permit-${p.state}`} key={p.slot}>
                  <strong>{p.slot}</strong>
                  <small>
                    {p.state === 'free'
                      ? 'Свободен'
                      : p.state === 'running'
                        ? 'Выполняется'
                        : 'Требует проверки'}
                  </small>
                </div>
              ))}
            </div>
            <p className="admin-help">
              Неопределённый вызов удерживает место до подтверждения завершения.
            </p>
          </section>
          {(['deliveries', 'jobs', 'memory'] as const).map((kind) => (
            <section className="admin-card" key={kind}>
              <h2>
                {kind === 'deliveries'
                  ? 'Незавершённые отправки'
                  : kind === 'jobs'
                    ? 'Фоновые задачи'
                    : 'Память решений'}
              </h2>
              {diagnostics.data?.[kind].length ? (
                diagnostics.data[kind].map((item) => (
                  <div className="admin-row diagnostic" key={item.id}>
                    <div>
                      <strong>
                        {item.kind ?? 'Запись памяти'} · {item.state}
                      </strong>
                      <small>{item.reason ?? 'Обрабатывается по расписанию'}</small>
                    </div>
                    {item.ticket_id && (
                      <button className="text-button" onClick={() => onTicket(item.ticket_id!)}>
                        Обращение
                        <Icon name="arrow" size={14} />
                      </button>
                    )}
                    {kind === 'deliveries' && item.message_id && item.state === 'unknown' && (
                      <>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => {
                            setResolution({ item, action: 'cancel' });
                            setEvidence('');
                          }}
                        >
                          Не повторять
                        </Button>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => {
                            setResolution({ item, action: 'retry' });
                            setEvidence('');
                          }}
                        >
                          Повторить
                        </Button>
                      </>
                    )}
                    {kind === 'jobs' &&
                      item.state === 'failed' &&
                      ['file', 'scan', 'memory_delete', 'message_revision'].includes(
                        item.kind ?? '',
                      ) && (
                        <Button
                          variant="secondary"
                          size="small"
                          disabled={busy}
                          onClick={() => void save(`/v1/admin/jobs/${item.id}/retry`, 'POST', {})}
                        >
                          Повторить
                        </Button>
                      )}
                  </div>
                ))
              ) : (
                <p className="admin-help">Нет записей.</p>
              )}
            </section>
          ))}
        </>
      )}
      {tab === 'audit' && (
        <section className="admin-card">
          <h2>Журнал изменений</h2>
          {audit.data?.items.length ? (
            <div className="audit-list">
              {audit.data.items.map((item) => (
                <div key={item.id}>
                  <time>{date(item.created_at, session.organization.timezone)}</time>
                  <strong>{item.action}</strong>
                  <code>{item.object_id}</code>
                </div>
              ))}
            </div>
          ) : (
            <Empty title="Журнал пуст">Изменения сотрудников и настроек появятся здесь.</Empty>
          )}
        </section>
      )}
      {editing !== undefined && (
        <Modal
          title={editing ? 'Изменить сотрудника' : 'Добавить сотрудника'}
          onClose={() => setEditing(undefined)}
          busy={busy}
          footer={
            <Button form="employee-form" type="submit" loading={busy}>
              Сохранить
            </Button>
          }
        >
          <ErrorNotice error={error} />
          <form
            id="employee-form"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              void save(
                `/v1/admin/employees${editing ? `/${editing.id}` : ''}`,
                editing ? 'PATCH' : 'POST',
                {
                  max_user_id: editing?.max_user_id ?? form.get('max_user_id'),
                  name: form.get('name'),
                  role: form.get('role'),
                  blocked: form.get('blocked') === 'on',
                },
                editing?.version ?? 0,
              );
            }}
          >
            <label className="form-field">
              MAX ID
              <input
                name="max_user_id"
                pattern="[0-9]+"
                required
                defaultValue={editing?.max_user_id}
                readOnly={!!editing}
              />
            </label>
            <label className="form-field">
              Имя
              <input name="name" required maxLength={120} defaultValue={editing?.name} />
            </label>
            <label className="form-field">
              Роль
              <select name="role" defaultValue={editing?.role ?? 'support'}>
                <option value="support">Сотрудник поддержки</option>
                <option value="supervisor">Руководитель</option>
                <option value="admin">Администратор</option>
              </select>
            </label>
            <label className="checkbox">
              <input type="checkbox" name="blocked" defaultChecked={editing?.blocked} />
              Заблокировать доступ
            </label>
          </form>
        </Modal>
      )}
      {dictionary !== undefined && (
        <Modal
          title={dictionary ? 'Изменить значение' : 'Добавить значение'}
          onClose={() => setDictionary(undefined)}
          busy={busy}
          footer={
            <Button form="dictionary-form" type="submit" loading={busy}>
              Сохранить
            </Button>
          }
        >
          <ErrorNotice error={error} />
          <form
            id="dictionary-form"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              void save(
                '/v1/admin/dictionaries',
                'PUT',
                {
                  dimension: dictionary?.dimension ?? form.get('dimension'),
                  code: dictionary?.code ?? form.get('code'),
                  label: form.get('label'),
                  rank: Number(form.get('rank')),
                  active: form.get('active') === 'on',
                },
                dictionary?.version ?? 0,
              );
            }}
          >
            <label className="form-field">
              Справочник
              <select
                name="dimension"
                defaultValue={dictionary?.dimension ?? 'tag'}
                disabled={!!dictionary}
              >
                <option value="tag">Тег</option>
                <option value="urgency">Срочность</option>
                <option value="complexity">Сложность</option>
              </select>
            </label>
            <label className="form-field">
              Код
              <input
                name="code"
                pattern="[a-z][a-z0-9_]*"
                maxLength={64}
                defaultValue={dictionary?.code}
                readOnly={!!dictionary}
                required
              />
            </label>
            <label className="form-field">
              Название
              <input name="label" defaultValue={dictionary?.label} maxLength={120} required />
            </label>
            <label className="form-field">
              Приоритет
              <input
                name="rank"
                type="number"
                min={0}
                max={100}
                defaultValue={dictionary?.rank ?? 0}
                required
              />
            </label>
            <label className="checkbox">
              <input type="checkbox" name="active" defaultChecked={dictionary?.active ?? true} />
              Использовать в новых обращениях
            </label>
          </form>
        </Modal>
      )}
      {template && (
        <Modal
          title="Изменить сообщение бота"
          onClose={() => setTemplate(null)}
          busy={busy}
          footer={
            <Button form="template-form" type="submit" loading={busy}>
              Сохранить
            </Button>
          }
        >
          <ErrorNotice error={error} />
          <form
            id="template-form"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              void save(
                `/v1/admin/templates/${template.code}`,
                'PUT',
                { body: form.get('body') },
                template.version,
              );
            }}
          >
            <label className="form-field">
              {template.code}
              <textarea
                name="body"
                rows={7}
                maxLength={3000}
                defaultValue={template.body}
                required
              />
            </label>
          </form>
        </Modal>
      )}
      {resolution && (
        <Modal
          title="Проверить результат отправки"
          onClose={() => setResolution(null)}
          busy={busy}
          footer={
            <Button
              loading={busy}
              disabled={evidence.trim().length < 10}
              onClick={() =>
                void save(
                  `/v1/messages/${resolution.item.message_id}/${resolution.action}`,
                  'POST',
                  { evidence },
                )
              }
            >
              {resolution.action === 'retry' ? 'Подтвердить повтор' : 'Не повторять отправку'}
            </Button>
          }
        >
          <p>
            Сервер не знает, доставлено ли сообщение. Повтор может создать дубликат у клиента.
            Укажите результаты проверки и основание решения.
          </p>
          <label className="form-field">
            Подтверждение проверки
            <textarea
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              minLength={10}
              maxLength={2000}
              required
            />
          </label>
          <ErrorNotice error={error} />
        </Modal>
      )}
    </>
  );
}
