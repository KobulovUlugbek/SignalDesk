import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Filter, MessageSquareText, Plus, Search, Send, SlidersHorizontal, TicketCheck } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import type { Customer, Priority, Ticket, TicketPage, TicketStatus, User } from '../lib/types';
import { Avatar, Badge, Empty, ErrorBanner, Field, Modal, PaneHeader, priorities, relative, SLA, Spinner, statuses, SubmitBar } from '../components/Ui';

type Props = { customers: Customer[]; team: User[]; writable: boolean; notify: (message: string) => void; refresh: () => void; openSignal: number; onOpen: () => void; initialTicketId?: number | null; onTicketClose: () => void };

export default function Tickets({ customers, team, writable, notify, refresh, openSignal, onOpen, initialTicketId, onTicketClose }: Props) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<TicketPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const [selected, setSelected] = useState<number | null>(initialTicketId ?? null);
  const [detail, setDetail] = useState<Ticket | null>(null);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ customer_id: '', subject: '', description: '', priority: 'medium' as Priority, channel: 'portal', category: 'technical', assignee_id: '' });
  useEffect(() => { if (openSignal > 0) setCreating(true); }, [openSignal]);
  useEffect(() => { if (initialTicketId) setSelected(initialTicketId); }, [initialTicketId]);
  useEffect(() => { setPage(1); }, [search, status, priority]);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      api.tickets({ q: search, status, priority, page }).then((res) => { if (active) { setRecords(res); setError(''); } }).catch((err: Error) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    }, search ? 250 : 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [search, status, priority, page, version]);
  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    api.ticket(selected).then(setDetail).catch((err: Error) => { notify(err.message); setSelected(null); });
  }, [selected, version]);
  const update = async (ticket: Ticket, data: object) => {
    try { await api.updateTicket(ticket.id, data); notify('Ticket erfolgreich aktualisiert'); setVersion((v) => v + 1); refresh(); }
    catch (err) { notify(err instanceof Error ? err.message : 'Änderung fehlgeschlagen'); }
  };
  const createTicket = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setFormError('');
    try {
      await api.createTicket({ ...form, customer_id: Number(form.customer_id), assignee_id: form.assignee_id ? Number(form.assignee_id) : null });
      notify('Neue Anfrage erstellt'); setCreating(false); setForm({ customer_id: '', subject: '', description: '', priority: 'medium', channel: 'portal', category: 'technical', assignee_id: '' }); setVersion((v) => v + 1); refresh(); onOpen();
    } catch (err) { setFormError(err instanceof ApiError ? Object.values(err.errors).flat().join(' ') || err.message : 'Speichern fehlgeschlagen'); }
    finally { setBusy(false); }
  };
  const addNote = async (event: React.FormEvent) => {
    event.preventDefault(); if (!selected || !note.trim()) return;
    setSavingNote(true);
    try { await api.addNote(selected, note); setNote(''); setVersion((v) => v + 1); notify('Interne Notiz hinzugefügt'); refresh(); }
    catch (err) { notify(err instanceof Error ? err.message : 'Fehler'); }
    finally { setSavingNote(false); }
  };
  return <>
    <PaneHeader eyebrow="WORKSPACE / SERVICE DESK" title="Ticket-Center" sub="Verwalte Anfragen, Prioritäten, SLAs und Zuständigkeiten an einem Ort." actions={<><a className="btn btn-secondary" href={api.exportUrl}><Download size={16} /> CSV exportieren</a>{writable && <button className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={16} /> Neues Ticket</button>}</>} />
    <div className="stats-strip"><div><TicketCheck size={19} /><strong>{records?.meta.total ?? '—'}</strong><span>Gefilterte Anfragen</span></div><div><SlidersHorizontal size={19} /><strong>{status === 'all' ? 'Alle Status' : statuses[status as TicketStatus]}</strong><span>Aktuelle Ansicht</span></div><div><Filter size={19} /><strong>{priority === 'all' ? 'Alle' : priorities[priority as Priority]}</strong><span>Prioritätsfilter</span></div></div>
    <section className="panel"><div className="section-toolbar"><div className="search-input"><Search size={18} /><input aria-label="Tickets durchsuchen" placeholder="Titel oder Kunde suchen ..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="filter-row"><select aria-label="Status filtern" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Alle Status</option><option value="open">Offen</option><option value="in_progress">In Bearbeitung</option><option value="resolved">Erledigt</option></select><select aria-label="Priorität filtern" value={priority} onChange={(e) => setPriority(e.target.value)}><option value="all">Alle Prioritäten</option><option value="urgent">Dringend</option><option value="high">Hoch</option><option value="medium">Mittel</option><option value="low">Niedrig</option></select></div></div>
      {error && <ErrorBanner message={error} retry={() => setVersion((v) => v + 1)} />}
      {loading && !records ? <Spinner /> : <div className="table-scroll"><table className="data-table tickets-table"><thead><tr><th>TICKET</th><th>KUNDE</th><th>PRIORITÄT</th><th>STATUS</th><th>ZUSTÄNDIG</th><th>SLA</th><th /></tr></thead><tbody>{records?.data.map((ticket) => <tr key={ticket.id} className="click-row" onClick={() => setSelected(ticket.id)}><td><strong className="table-main">{ticket.subject}</strong><span className="table-sub">#{ticket.id.toString().padStart(4, '0')} · {relative(ticket.created_at)}</span></td><td><span className="table-company">{ticket.customer?.company}</span></td><td><Badge tone={ticket.priority}>{priorities[ticket.priority]}</Badge></td><td><Badge tone={ticket.status}>{statuses[ticket.status]}</Badge></td><td>{ticket.assignee ? <div className="assignee-cell"><Avatar name={ticket.assignee.name} size="small" /><span>{ticket.assignee.name.split(' ')[0]}</span></div> : <span className="subtle">Nicht zugewiesen</span>}</td><td><SLA due={ticket.due_at} resolved={ticket.resolved_at} /></td><td><ChevronRight size={17} className="row-chevron" /></td></tr>)}</tbody></table>{!loading && records?.data.length === 0 && <Empty title="Keine Tickets gefunden" description="Passe deine Such- oder Filterkriterien an." />}</div>}
      <div className="table-pagination"><span>{records?.meta.from ?? 0}–{records?.meta.to ?? 0} von {records?.meta.total ?? 0} Einträgen</span><div><button aria-label="Vorherige Seite" disabled={page <= 1 || loading} onClick={() => setPage((v) => v - 1)}><ChevronLeft size={17} /></button><span>Seite {page} / {records?.meta.last_page ?? 1}</span><button aria-label="Nächste Seite" disabled={page >= (records?.meta.last_page ?? 1) || loading} onClick={() => setPage((v) => v + 1)}><ChevronRight size={17} /></button></div></div>
    </section>
    {creating && <Modal title="Neue Anfrage erstellen" subtitle="Alle Felder werden serverseitig validiert. Die SLA-Frist berechnet Laravel automatisch." close={() => setCreating(false)}><form className="form-stack" onSubmit={createTicket}>{formError && <ErrorBanner message={formError} />}<Field label="Kunde *"><select value={form.customer_id} required onChange={(e) => setForm({ ...form, customer_id: e.target.value })}><option value="">Kunden auswählen</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}</select></Field><Field label="Betreff *"><input minLength={5} maxLength={160} required placeholder="Worum geht es?" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field><Field label="Beschreibung *"><textarea rows={4} required minLength={10} placeholder="Beschreibe die Anfrage möglichst genau ..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field><div className="form-grid"><Field label="Priorität"><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>{Object.entries(priorities).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field><Field label="Kanal"><select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}><option value="portal">Portal</option><option value="email">E-Mail</option><option value="phone">Telefon</option><option value="chat">Chat</option></select></Field></div><div className="form-grid"><Field label="Kategorie"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="technical">Technik</option><option value="billing">Abrechnung</option><option value="account">Konto</option><option value="feature">Funktion</option></select></Field><Field label="Zuständig"><select value={form.assignee_id} onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}><option value="">Nicht zugewiesen</option>{team.filter((u) => u.role !== 'viewer').map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></Field></div><SubmitBar cancel={() => setCreating(false)} busy={busy} label="Ticket erstellen" /></form></Modal>}
    {selected !== null && <Modal title={detail ? `Ticket #${String(detail.id).padStart(4, '0')}` : 'Ticket laden'} subtitle={detail?.customer?.company} width="large" close={() => { setSelected(null); setDetail(null); onTicketClose(); }}>
      {!detail ? <Spinner /> : <div className="ticket-detail"><div className="detail-header"><h3>{detail.subject}</h3><div className="detail-tags"><Badge tone={detail.priority}>{priorities[detail.priority]}</Badge><Badge tone={detail.status}>{statuses[detail.status]}</Badge></div></div><p className="detail-description">{detail.description}</p><div className="detail-facts"><div><small>ERSTELLT</small><strong>{new Date(detail.created_at).toLocaleString('de-DE')}</strong></div><div><small>DEADLINE</small><strong>{new Date(detail.due_at).toLocaleString('de-DE')}</strong></div><div><small>KANAL</small><strong>{detail.channel}</strong></div></div>
      {writable && <div className="detail-controls"><Field label="Status"><select value={detail.status} onChange={(e) => update(detail, { status: e.target.value })}>{Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field><Field label="Priorität"><select value={detail.priority} onChange={(e) => update(detail, { priority: e.target.value })}>{Object.entries(priorities).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field><Field label="Zuständigkeit"><select value={detail.assignee?.id ?? ''} onChange={(e) => update(detail, { assignee_id: e.target.value ? Number(e.target.value) : null })}><option value="">Nicht zugewiesen</option>{team.filter((u) => u.role !== 'viewer').map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></Field></div>}
      <div className="detail-notes"><h4><MessageSquareText size={17} /> Interne Notizen <span>{detail.notes?.length ?? 0}</span></h4>{detail.notes?.length ? detail.notes.map((entry) => <div className="note-card" key={entry.id}><div><Avatar size="small" name={entry.author} /><strong>{entry.author}</strong><span>{relative(entry.created_at)}</span></div><p>{entry.body}</p></div>) : <p className="subtle">Noch keine internen Notizen vorhanden.</p>}{writable && <form onSubmit={addNote} className="add-note"><textarea required minLength={2} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Interne Notiz hinzufügen ..." /><button className="btn btn-primary" disabled={savingNote || !note.trim()}><Send size={15} /> Notiz speichern</button></form>}</div>
      </div>}
    </Modal>}
  </>;
}
