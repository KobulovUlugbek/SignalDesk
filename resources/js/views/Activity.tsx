import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, FileClock, History, Shield } from 'lucide-react';
import { api } from '../lib/api';
import type { Activity, Page } from '../lib/types';
import { Badge, Empty, ErrorBanner, PaneHeader, relative, Spinner } from '../components/Ui';

export default function ActivityPage() {
  const [data, setData] = useState<Page<Activity> | null>(null);
  const [page, setPage] = useState(1);
  const [entity, setEntity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { let valid = true; setLoading(true); api.activity(page, entity).then((response) => { if (valid) { setData(response); setError(''); } }).catch((e: Error) => { if (valid) setError(e.message); }).finally(() => { if (valid) setLoading(false); }); return () => { valid = false; }; }, [page, entity]);
  return <><PaneHeader eyebrow="SECURITY / AUDIT TRAIL" title="Aktivitätsprotokoll" sub="Ein nachvollziehbarer Verlauf aller Änderungen in deinem Workspace." actions={<span className="date-chip"><Shield size={15} /> Audit Trail</span>} />
    <section className="panel"><div className="section-toolbar"><div className="activity-toolbar-title"><FileClock size={20} /><strong>Änderungsverlauf</strong></div><select aria-label="Aktivität filtern" value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1); }}><option value="">Alle Bereiche</option><option value="ticket">Tickets</option><option value="task">Aufgaben</option><option value="customer">Kunden</option><option value="article">Wissensdatenbank</option><option value="automation">Automatisierungen</option></select></div>{error && <ErrorBanner message={error} />}{loading && !data ? <Spinner /> : <div className="audit-feed">{data?.data.map((item) => <div key={item.id} className="audit-entry"><span className="audit-symbol"><History size={18} /></span><div className="audit-entry-body"><div><strong>{item.detail}</strong><Badge tone={item.action === 'deleted' ? 'urgent' : item.action === 'automation' ? 'medium' : 'open'}>{({ created: 'Erstellt', updated: 'Geändert', deleted: 'Gelöscht', automation: 'Automatik', note: 'Notiz' })[item.action as 'created' | 'updated' | 'deleted' | 'automation' | 'note'] ?? item.action}</Badge></div><p><span>{item.actor?.name ?? 'System'}</span> · {item.entity_type} #{item.entity_id ?? '—'}</p></div><time>{relative(item.created_at)}</time></div>)}{!data?.data.length && <Empty title="Keine Einträge vorhanden" />}</div>}<div className="table-pagination"><span>{data?.total ?? 0} protokollierte Aktivitäten</span><div><button aria-label="Vorherige Seite" disabled={page === 1} onClick={() => setPage((v) => v - 1)}><ChevronLeft size={17} /></button><span>{page} / {data?.last_page ?? 1}</span><button aria-label="Nächste Seite" disabled={page >= (data?.last_page ?? 1)} onClick={() => setPage((v) => v + 1)}><ChevronRight size={17} /></button></div></div></section>
  </>;
}
