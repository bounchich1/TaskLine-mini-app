import { Button, Input } from '@maxhub/max-ui';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useRef, useState, Fragment } from 'react';

import { AdminPanel } from './AdminPanel';
import { api, events, setSession } from './api';
import { waitForLaunch, setViewport } from './platform';
import { TicketCard, type Draft } from './TicketCard';
import { dayBoundary } from './time';
import type {
  Dictionary,
  Employee,
  Filters,
  Notification,
  Session,
  Ticket,
  TicketPage,
} from './types';
import { Badge, date, Empty, ErrorNotice, Icon, statuses } from './ui';

const defaults: Filters = {
  tab: 'open',
  q: '',
  tag: '',
  urgency: '',
  complexity: '',
  status: '',
  assignee: '',
  from: '',
  to: '',
  sort: 'urgency',
};
const demo = import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH === 'true';
let pendingLogin: Promise<Session> | null = null;
async function login() {
  if (!pendingLogin) {
    pendingLogin = (async () => {
      if (demo) {
        return api<Session>('/v1/auth/dev', {
          method: 'POST',
          body: { user_id: import.meta.env.VITE_DEV_USER_ID ?? '1' },
        });
      }
      const raw = await waitForLaunch();
      if (!raw) {
        throw new Error(
          'Откройте мини-приложение через бота в MAX. Доступ предоставляется сотрудникам поддержки.',
        );
      }
      return api<Session>('/v1/auth/max', { method: 'POST', body: { init_data: raw } });
    })();
  }
  try {
    return await pendingLogin;
  } catch (error) {
    pendingLogin = null;
    throw error;
  }
}
export function App() {
  const [session, setUser] = useState<Session | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const drafts = useRef(new Map<string, Draft>());
  const previousUser = useRef<string | null>(null);
  const cache = useQueryClient();
  const authenticate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await login();
      if (previousUser.current && previousUser.current !== user.employee.id) {
        drafts.current.clear();
      }
      previousUser.current = user.employee.id;
      setSession(user);
      setUser(user);
      void setViewport();
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void authenticate();
  }, [authenticate]);
  useEffect(() => {
    const expired = () => {
      pendingLogin = null;
      setSession(null);
      setUser(null);
      setLoading(false);
      setError(
        new Error(
          'Сессия истекла. Откройте приложение заново из MAX. Неотправленный черновик сохранён до закрытия окна.',
        ),
      );
      cache.clear();
    };
    window.addEventListener('session-expired', expired);
    return () => window.removeEventListener('session-expired', expired);
  }, [cache]);
  if (!session) {
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
        {!loading && (
          <Button
            onClick={() => {
              pendingLogin = null;
              void authenticate();
            }}
          >
            Повторить вход
          </Button>
        )}
        <span className="launch-foot">Только для сотрудников организации</span>
      </div>
    );
  }
  return <Workspace session={session} drafts={drafts.current} />;
}
function Workspace({ session, drafts }: { session: Session; drafts: Map<string, Draft> }) {
  const cache = useQueryClient();
  const [filters, setFilters] = useState<Filters>(defaults);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [section, setSection] = useState<'tickets' | 'notifications' | 'admin'>('tickets');
  const [filterOpen, setFilterOpen] = useState(false);
  const [connection, setConnection] = useState<'live' | 'reconnecting'>('reconnecting');
  const [queueChanged, setQueueChanged] = useState(false);
  const dictionaries = useQuery({
    queryKey: ['dictionaries'],
    queryFn: () => api<{ items: Dictionary[] }>('/v1/dictionaries'),
  });
  const employees = useQuery({
    queryKey: ['employees'],
    queryFn: () => api<{ items: Employee[] }>('/v1/employees'),
  });
  const notifications = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api<{ items: Notification[] }>('/v1/notifications'),
    refetchInterval: 15000,
  });
  useEffect(() => {
    const timer = setTimeout(() => setFilters((f) => ({ ...f, q: search })), 300);
    return () => clearTimeout(timer);
  }, [search]);
  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (!v) {
        continue;
      }
      if (k === 'from' || k === 'to') {
        p.set(k, dayBoundary(v, session.organization.timezone, k === 'to'));
      } else {
        p.set(k, v);
      }
    }
    return p.toString();
  }, [filters, session.organization.timezone]);
  const list = useInfiniteQuery({
    queryKey: ['tickets', queryString],
    queryFn: ({ pageParam }) =>
      api<TicketPage>(
        `/v1/tickets?${queryString}${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ''}`,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.next_cursor,
    refetchInterval: connection === 'reconnecting' ? 15000 : false,
  });
  const refresh = useCallback(() => {
    void cache.invalidateQueries({ queryKey: ['tickets'] });
    void cache.invalidateQueries({ queryKey: ['ticket'] });
    void cache.invalidateQueries({ queryKey: ['messages'] });
    void cache.invalidateQueries({ queryKey: ['notifications'] });
    void cache.invalidateQueries({ queryKey: ['dictionaries'] });
    void cache.invalidateQueries({ queryKey: ['employees'] });
    setQueueChanged(true);
  }, [cache]);
  useEffect(() => {
    const controller = new AbortController();
    void events('0', refresh, setConnection, controller.signal);
    return () => controller.abort();
  }, [refresh]);
  const rows = useMemo(() => list.data?.pages.flatMap((p) => p.items) ?? [], [list.data]);
  const counts = list.data?.pages[0]?.counts;
  const unread = notifications.data?.items.filter((n) => !n.read_at).length ?? 0;
  const change = (name: keyof Filters, value: string) =>
    setFilters((f) => ({ ...f, [name]: value }));
  const openTicket = (id: string) => {
    setSection('tickets');
    setExpanded(id);
  };
  const columns = useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        id: 'number',
        header: 'Обращение',
        cell: ({ row }) => (
          <button
            className="ticket-link"
            onClick={() => setExpanded((id) => (id === row.original.id ? null : row.original.id))}
            aria-expanded={expanded === row.original.id}
          >
            <span className={`row-arrow ${expanded === row.original.id ? 'rotated' : ''}`}>
              <Icon name="arrow" size={15} />
            </span>
            <span>
              №{row.original.number}
              <small>
                {row.original.ai_status === 'pending' ? 'Определяется…' : row.original.tag_label}
                {row.original.review_required && ' · Проверить'}
              </small>
            </span>
          </button>
        ),
      },
      {
        id: 'urgency',
        header: 'Срочность',
        cell: ({ row }) => (
          <span className={`urgency urgency-${row.original.urgency}`}>
            {row.original.ai_status === 'pending' ? 'Определяется' : row.original.urgency_label}
          </span>
        ),
      },
      {
        id: 'complexity',
        header: 'Сложность',
        cell: ({ row }) => (
          <span className="muted">
            {row.original.ai_status === 'pending' ? 'Определяется' : row.original.complexity_label}
          </span>
        ),
      },
      { id: 'status', header: 'Статус', cell: ({ row }) => <Badge status={row.original.status} /> },
      {
        id: 'created_at',
        header: 'Создано',
        cell: ({ row }) => (
          <time className="date-cell" dateTime={row.original.created_at}>
            {date(row.original.created_at, session.organization.timezone)}
          </time>
        ),
      },
      {
        id: 'assignee',
        header: 'Исполнитель',
        cell: ({ row }) =>
          row.original.assignee_name ? (
            <span className="assignee">
              <span className="avatar-small">{row.original.assignee_name[0]}</span>
              {row.original.assignee_name}
            </span>
          ) : (
            <span className="muted">Не назначен</span>
          ),
      },
      ...(filters.tab === 'closed'
        ? ([
            {
              id: 'rating',
              header: 'Оценка',
              cell: ({ row }: { row: { original: Ticket } }) => (
                <span>
                  {row.original.rating
                    ? `${row.original.rating} / 10`
                    : row.original.status === 'awaiting_rating'
                      ? 'Ожидается'
                      : 'Без оценки'}
                </span>
              ),
            },
          ] as ColumnDef<Ticket>[])
        : []),
    ],
    [expanded, filters.tab, session.organization.timezone],
  );
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setSection('tickets');
          }}
        >
          <span className="brand-mark">
            <Icon name="inbox" size={23} />
          </span>
          <span>
            Линия<span className="brand-caption">поддержка в MAX</span>
          </span>
        </a>
        <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav aria-label="Основная навигация">
          <button
            className={section === 'tickets' ? 'nav-item active' : 'nav-item'}
            onClick={() => setSection('tickets')}
          >
            <Icon name="inbox" />
            <span>Обращения</span>
            <span className="nav-count">{counts?.open ?? '—'}</span>
          </button>
          <button
            className={section === 'notifications' ? 'nav-item active' : 'nav-item'}
            onClick={() => setSection('notifications')}
          >
            <Icon name="bell" />
            <span>Уведомления</span>
            {unread > 0 && <span className="nav-count">{unread}</span>}
          </button>
          {(session.capabilities.admin || session.capabilities.operations) && (
            <button
              className={section === 'admin' ? 'nav-item active' : 'nav-item'}
              onClick={() => setSection('admin')}
            >
              <Icon name="settings" />
              <span>Управление</span>
            </button>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="channel-card">
            <span className="online-dot" />
            <div>
              Канал поддержки<small>MAX Messenger</small>
            </div>
            <span className="channel-symbol">М</span>
          </div>
          <div className="profile">
            <span className="avatar">{session.employee.name[0]}</span>
            <div>
              {session.employee.name}
              <small>
                {session.employee.role === 'support'
                  ? 'Специалист поддержки'
                  : session.employee.role === 'admin'
                    ? 'Администратор'
                    : 'Руководитель'}
              </small>
            </div>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <span>{session.organization.name}</span>
          <span className={`connection ${connection}`}>
            <i />
            {connection === 'live' ? 'Обновляется в реальном времени' : 'Восстанавливаем связь'}
          </span>
        </header>
        <div className="main-content">
          {demo && (
            <div className="demo-note">
              Локальный стенд · вымышленные обращения · сообщения в MAX не отправляются
            </div>
          )}
          {section === 'tickets' ? (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">ПОДДЕРЖКА КЛИЕНТОВ</span>
                  <h1>
                    Обращения<span className="title-dot">.</span>
                  </h1>
                  <p>Каждый вопрос — начало решения.</p>
                </div>
                <Button
                  variant="secondary"
                  size="small"
                  iconBefore={<Icon name="refresh" size={16} />}
                  onClick={() => {
                    refresh();
                    setQueueChanged(false);
                  }}
                >
                  Обновить
                </Button>
              </div>
              <div className="summary-grid">
                <div className="summary-card">
                  <span className="summary-icon teal">
                    <Icon name="inbox" />
                  </span>
                  <div>
                    <span>В открытой очереди</span>
                    <strong>{counts?.open ?? '—'}</strong>
                  </div>
                  <span className="summary-caption">ждут решения</span>
                </div>
                <div className="summary-card">
                  <span className="summary-icon blue">
                    <Icon name="check" />
                  </span>
                  <div>
                    <span>Закрытые обращения</span>
                    <strong>{counts?.closed ?? '—'}</strong>
                  </div>
                  <span className="summary-caption">с историей оценок</span>
                </div>
                <div className="summary-card small-note">
                  <Icon name="spark" size={22} />
                  <p>
                    ИИ помогает с решением.
                    <br />
                    <strong>Последнее слово — за вами.</strong>
                  </p>
                </div>
              </div>
              <section className="queue" aria-label="Очередь обращений">
                <div className="queue-tabs">
                  <div role="tablist" aria-label="Статус обращений">
                    {(['open', 'closed'] as const).map((tab) => (
                      <button
                        role="tab"
                        key={tab}
                        aria-selected={filters.tab === tab}
                        className={filters.tab === tab ? 'queue-tab selected' : 'queue-tab'}
                        onClick={() => setFilters((f) => ({ ...f, tab, status: '' }))}
                      >
                        {tab === 'open' ? 'Открытые' : 'Закрытые'}
                        <span>{counts?.[tab] ?? 0}</span>
                      </button>
                    ))}
                  </div>
                  <span className="queue-subtitle">
                    {queueChanged ? (
                      <button className="text-button" onClick={() => setQueueChanged(false)}>
                        Данные обновлены <Icon name="check" size={14} />
                      </button>
                    ) : (
                      'Единая очередь команды'
                    )}
                  </span>
                </div>
                <div className="toolbar">
                  <div className="search">
                    <Input
                      aria-label="Поиск по номеру или тексту"
                      placeholder="Номер или текст обращения"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      iconBefore={<Icon name="search" size={19} />}
                    />
                  </div>
                  <button
                    className={`filter-button ${filterOpen ? 'selected' : ''}`}
                    onClick={() => setFilterOpen(!filterOpen)}
                    aria-expanded={filterOpen}
                  >
                    <Icon name="filter" size={18} />
                    Фильтры
                  </button>
                  <label className="sort-label">
                    <span className="sr-only">Сортировка</span>
                    <select value={filters.sort} onChange={(e) => change('sort', e.target.value)}>
                      <option value="urgency">По срочности</option>
                      <option value="newest">Сначала новые</option>
                      <option value="oldest">Сначала старые</option>
                      <option value="complexity">По сложности</option>
                      <option value="rating">По оценке</option>
                    </select>
                  </label>
                </div>
                {filterOpen && (
                  <div className="filters">
                    {(['tag', 'urgency', 'complexity'] as const).map((d) => (
                      <label key={d}>
                        {d === 'tag' ? 'Тег' : d === 'urgency' ? 'Срочность' : 'Сложность'}
                        <select value={filters[d]} onChange={(e) => change(d, e.target.value)}>
                          <option value="">Все</option>
                          {dictionaries.data?.items
                            .filter((v) => v.dimension === d)
                            .map((v) => (
                              <option key={v.code} value={v.code}>
                                {v.label}
                                {!v.active ? ' (архив)' : ''}
                              </option>
                            ))}
                        </select>
                      </label>
                    ))}
                    <label>
                      Статус
                      <select
                        value={filters.status}
                        onChange={(e) => change('status', e.target.value)}
                      >
                        <option value="">Все</option>
                        {Object.entries(statuses).map(([code, label]) => (
                          <option key={code} value={code}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Исполнитель
                      <select
                        value={filters.assignee}
                        onChange={(e) => change('assignee', e.target.value)}
                      >
                        <option value="">Все сотрудники</option>
                        {employees.data?.items.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      С даты
                      <input
                        type="date"
                        value={filters.from}
                        onChange={(e) => change('from', e.target.value)}
                      />
                    </label>
                    <label>
                      По дату
                      <input
                        type="date"
                        value={filters.to}
                        onChange={(e) => change('to', e.target.value)}
                      />
                    </label>
                    <button
                      className="text-button"
                      onClick={() => {
                        setFilters({ ...defaults, tab: filters.tab });
                        setSearch('');
                      }}
                    >
                      Сбросить
                    </button>
                  </div>
                )}
                <ErrorNotice error={list.error} />
                {list.isPending ? (
                  <div className="skeleton-rows" aria-label="Загрузка обращений">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} />
                    ))}
                  </div>
                ) : rows.length === 0 ? (
                  <Empty title={filters.q || filterOpen ? 'Ничего не найдено' : 'Очередь свободна'}>
                    {filters.q || filterOpen
                      ? 'Попробуйте изменить поиск или фильтры.'
                      : 'Новые обращения появятся здесь автоматически.'}
                  </Empty>
                ) : (
                  <div className="table-scroll">
                    <table className="ticket-table">
                      <thead>
                        {table.getHeaderGroups().map((group) => (
                          <tr key={group.id}>
                            {group.headers.map((header) => (
                              <th key={header.id}>
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {table.getRowModel().rows.map((row) => (
                          <Fragment key={row.id}>
                            <tr
                              className={
                                expanded === row.original.id ? 'ticket-row expanded' : 'ticket-row'
                              }
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                              ))}
                            </tr>
                            {expanded === row.original.id && (
                              <tr className="detail-row">
                                <td colSpan={columns.length}>
                                  <TicketCard
                                    id={expanded}
                                    session={session}
                                    employees={employees.data?.items ?? []}
                                    dictionaries={dictionaries.data?.items ?? []}
                                    drafts={drafts}
                                    onClose={() => setExpanded(null)}
                                  />
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {expanded && !rows.some((r) => r.id === expanded) && (
                  <TicketCard
                    id={expanded}
                    session={session}
                    employees={employees.data?.items ?? []}
                    dictionaries={dictionaries.data?.items ?? []}
                    drafts={drafts}
                    onClose={() => setExpanded(null)}
                  />
                )}
                <div className="queue-footer">
                  <span>Показано {rows.length} обращений</span>
                  {list.hasNextPage ? (
                    <Button
                      variant="secondary"
                      size="small"
                      loading={list.isFetchingNextPage}
                      onClick={() => void list.fetchNextPage()}
                    >
                      Показать ещё
                    </Button>
                  ) : (
                    <span>Часовой пояс: {session.organization.timezone}</span>
                  )}
                </div>
              </section>
              <p className="privacy-footer">
                <Icon name="user" size={14} />
                Ответы клиентам отправляются от имени бота. Данные сотрудников остаются внутри
                команды.
              </p>
            </>
          ) : section === 'notifications' ? (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">СОБЫТИЯ КОМАНДЫ</span>
                  <h1>
                    Уведомления<span className="title-dot">.</span>
                  </h1>
                </div>
              </div>
              <ErrorNotice error={notifications.error} />
              <section className="notification-list">
                {notifications.data?.items.length ? (
                  notifications.data.items.map((n) => (
                    <button
                      className={`notification ${n.read_at ? 'read' : ''}`}
                      key={n.id}
                      onClick={() => {
                        void api(`/v1/notifications/${n.id}/read`, {
                          method: 'POST',
                          body: {},
                        }).then(() => cache.invalidateQueries({ queryKey: ['notifications'] }));
                        openTicket(n.ticket_id);
                      }}
                    >
                      <span className="notification-icon">
                        <Icon name={n.type === 'rating.received' ? 'check' : 'inbox'} />
                      </span>
                      <span>
                        <strong>
                          {{
                            'ticket.created': 'Новое обращение',
                            'message.from_client': 'Новое сообщение клиента',
                            'ticket.transferred': 'Вам передано обращение',
                            'rating.received': 'Клиент оставил оценку',
                          }[n.type] ?? 'Изменение обращения'}
                        </strong>
                        <small>{date(n.created_at, session.organization.timezone)}</small>
                      </span>
                      <Icon name="arrow" size={16} />
                    </button>
                  ))
                ) : (
                  <Empty title="Вы в курсе всех событий">
                    Новые сообщения и оценки появятся здесь.
                  </Empty>
                )}
              </section>
            </>
          ) : (
            <AdminPanel session={session} onTicket={openTicket} />
          )}
        </div>
      </main>
    </div>
  );
}
