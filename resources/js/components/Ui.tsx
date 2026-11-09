import type { ReactNode } from 'react';
import { X, LoaderCircle, AlertCircle, Inbox, Check, CalendarClock } from 'lucide-react';
import type { Priority, TicketStatus } from '../lib/types';

export const priorities: Record<Priority, string> = { urgent: 'Dringend', high: 'Hoch', medium: 'Mittel', low: 'Niedrig' };
export const statuses: Record<TicketStatus, string> = { open: 'Offen', in_progress: 'In Bearbeitung', resolved: 'Erledigt' };
export const taskStatuses: Record<string, string> = { todo: 'Offen', doing: 'In Arbeit', done: 'Erledigt' };
export const initials = (name: string) => name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();
export const date = (value?: string | null) => value ? new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const shortDate = (value?: string | null) => value ? new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }) : '—';
export const relative = (value: string) => {
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return 'gerade eben';
  if (minutes < 60) return `vor ${minutes} Min.`;
  if (minutes < 1440) return `vor ${Math.floor(minutes / 60)} Std.`;
  return `vor ${Math.floor(minutes / 1440)} T.`;
};
export function Badge({ children, tone = 'neutral', dot = true }: { children: ReactNode; tone?: string; dot?: boolean }) {
  return <span className={`badge badge-${tone}`}>{dot && <span className="badge-dot" />}{children}</span>;
}
export function Avatar({ name, size = 'regular' }: { name: string; size?: 'regular' | 'small' | 'large' }) {
  const palette = ['peach', 'purple', 'blue', 'green', 'pink'];
  return <span title={name} className={`avatar avatar-${size} avatar-${palette[name.length % palette.length]}`}>{initials(name)}</span>;
}
export function Spinner({ label = 'Daten werden geladen ...' }: { label?: string }) {
  return <div className="loading-state"><LoaderCircle className="rotate" size={21} />{label}</div>;
}
export function Empty({ title = 'Noch keine Einträge', description = 'Für diese Auswahl sind keine Daten vorhanden.' }: { title?: string; description?: string }) {
  return <div className="empty"><div className="empty-icon"><Inbox size={22} /></div><strong>{title}</strong><p>{description}</p></div>;
}
export function ErrorBanner({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="error-banner"><AlertCircle size={18} /><span>{message}</span>{retry && <button onClick={retry}>Erneut versuchen</button>}</div>;
}
export function Modal({ title, subtitle, children, close, width = 'medium' }: { title: string; subtitle?: string; children: ReactNode; close: () => void; width?: 'medium' | 'large' }) {
  return <div className="modal-scrim" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><section role="dialog" aria-modal="true" aria-label={title} className={`modal modal-${width}`}><div className="modal-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><button aria-label="Schließen" className="icon-btn" onClick={close}><X size={20} /></button></div>{children}</section></div>;
}
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="form-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
export function SubmitBar({ cancel, busy, label = 'Speichern' }: { cancel: () => void; busy: boolean; label?: string }) {
  return <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={cancel}>Abbrechen</button><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? <LoaderCircle size={16} className="rotate" /> : <Check size={16} />}{label}</button></div>;
}
export function SLA({ due, resolved }: { due: string | null; resolved: string | null }) {
  if (resolved) return <span className="subtle"><Check size={13} /> Erledigt</span>;
  const overdue = due ? new Date(due).getTime() < Date.now() : false;
  return <span className={overdue ? 'sla-breach' : 'subtle'}><CalendarClock size={13} />{due ? shortDate(due) : '—'}{overdue ? ' · Überfällig' : ''}</span>;
}
export function PaneHeader({ eyebrow, title, sub, actions }: { eyebrow?: string; title: string; sub: string; actions?: ReactNode }) {
  return <div className="pane-title"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1><p>{sub}</p></div>{actions && <div className="pane-actions">{actions}</div>}</div>;
}
