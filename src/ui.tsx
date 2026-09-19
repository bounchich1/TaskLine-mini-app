import { useEffect,useRef,type ReactNode } from 'react';
import { Button } from '@maxhub/max-ui';
export function Icon({name,size=20}:{name:string;size?:number}){
  const paths:Record<string,ReactNode>={
    inbox:<><path d="M4 4h16v16H4z"/><path d="M4 13h5l2 3h2l2-3h5"/></>,
    search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></>,
    bell:<><path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M9 21h6"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="m9 3 6 0 1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z"/></>,
    arrow:<path d="m9 5 7 7-7 7"/>,back:<path d="m15 5-7 7 7 7"/>,
    send:<><path d="m3 3 18 9-18 9 4-9-4-9z"/><path d="M7 12h14"/></>,
    clip:<path d="m9 16 8-8a3 3 0 0 0-4-4L4 13a5 5 0 0 0 7 7l9-9"/>,
    check:<path d="m5 12 4 4L20 5"/>,close:<path d="m6 6 12 12M6 18 18 6"/>,
    spark:<><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/></>,
    filter:<><path d="M3 6h18M6 12h12M9 18h6"/></>,
    refresh:<><path d="M20 8a8 8 0 1 0 0 8M20 3v5h-5"/></>,
    user:<><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
    download:<><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></>,
    clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.inbox}</svg>;
}
export const statuses:Record<string,string>={open:'Открыта',in_progress:'В работе',awaiting_rating:'Ожидает оценки',closed:'Закрыта'};
export const deliveryNames:Record<string,string>={queued:'В очереди',sending:'Отправляется',retry_wait:'Повтор отправки',delivered:'Доставлено',unknown:'Доставка не подтверждена',failed:'Не доставлено',canceled:'Отменено',received:'Получено',internal:'Внутренняя запись'};
export const learningNames:Record<string,string>={queued:'В очереди',analyzing:'Анализ переписки',persistence_pending:'Сохранение знаний',learned:'Сохранено в памяти',needs_review:'Нужна проверка',failed:'Ошибка обучения',invalidated:'Данные исключены',suppressed:'Обработка остановлена'};
export function Badge({status}:{status:string}){return <span className={`badge status-${status}`}><span className="status-dot"/>{statuses[status] ?? status}</span>;}
export function date(value:string|null|undefined,timeZone:string,short=false){if(!value)return '—';return new Intl.DateTimeFormat('ru-RU',{timeZone,day:'2-digit',month:'short',...(short?{}:{hour:'2-digit',minute:'2-digit'})}).format(new Date(value));}
export function ErrorNotice({error}:{error:unknown}){return error?<div className="error-notice" role="alert">{error instanceof Error?error.message:'Не удалось загрузить данные.'}</div>:null;}
export function Empty({title,children}:{title:string;children:ReactNode}){return <div className="empty"><div className="empty-icon"><Icon name="inbox" size={32}/></div><h3>{title}</h3><p>{children}</p></div>;}
export function Modal({title,children,onClose,footer,busy=false}:{title:string;children:ReactNode;onClose:()=>void;footer?:ReactNode;busy?:boolean}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const dialog=ref.current;const previous=document.activeElement as HTMLElement|null;dialog?.showModal();return()=>{dialog?.close();previous?.focus();};},[]);
  return <dialog ref={ref} className="dialog" onCancel={event=>{event.preventDefault();if(!busy)onClose();}} aria-labelledby="dialog-title"><div className="dialog-head"><h2 id="dialog-title">{title}</h2><button className="icon-button" aria-label="Закрыть окно" disabled={busy} onClick={onClose}><Icon name="close"/></button></div><div className="dialog-body">{children}</div><div className="dialog-footer"><Button variant="secondary" disabled={busy} onClick={onClose}>Отмена</Button>{footer}</div></dialog>;
}
