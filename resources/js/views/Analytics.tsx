import { useEffect, useState } from 'react';
import { ChartNoAxesCombined, Clock3, FileText, Info, Users2 } from 'lucide-react';
import { api } from '../lib/api';
import type { Analytics as AnalyticsData } from '../lib/types';
import { ErrorBanner, PaneHeader, Spinner } from '../components/Ui';
import { DonutChart, SegmentedBars, VolumeChart } from '../components/Charts';

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => { api.analytics().then(setData).catch((e: Error) => setError(e.message)); }, [reload]);
  if (error) return <ErrorBanner message={error} retry={() => { setError(''); setReload((v) => v + 1); }} />;
  return <><PaneHeader eyebrow="INSIGHTS / PERFORMANCE" title="Analytics & Reports" sub="Zahlen, Trends und Performance im Service Desk – direkt aus der Datenbank." actions={<span className="date-chip"><ChartNoAxesCombined size={15} /> Live-Daten</span>} />
    {!data ? <Spinner /> : <><div className="analytics-stat-row"><div><Clock3 size={20} /><span>Ø Lösungszeit</span><strong>{data.avg_resolution_hours.toLocaleString('de-DE')} h</strong><small>Abgeschlossene Tickets</small></div><div><FileText size={20} /><span>Wissensartikel</span><strong>{data.article_count}</strong><small>Öffentlich freigegeben</small></div><div><Users2 size={20} /><span>Service-Team</span><strong>{data.team.length}</strong><small>Workspace-Mitglieder</small></div></div>
    <div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-heading"><div><span className="section-overline">TRAFFIC</span><h3>Ticket-Eingänge</h3><p>14-Tage-Trend</p></div></div><VolumeChart data={data.volume} height={250} /></section><section className="panel chart-panel"><div className="panel-heading"><div><span className="section-overline">CHANNELS</span><h3>Kommunikationskanäle</h3><p>Verteilung nach Eingangsquelle</p></div></div><DonutChart values={data.channel.map((c) => c.count)} labels={data.channel.map((c) => ({ portal: 'Portal', email: 'E-Mail', chat: 'Chat', phone: 'Telefon' })[c.channel as 'portal' | 'email' | 'chat' | 'phone'] ?? c.channel)} colors={['#7665e8', '#37b5aa', '#eeb36e', '#75a6e7']} center={data.channel.reduce((s, c) => s + c.count, 0)} subtitle="Tickets" /></section></div>
    <div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-heading"><div><span className="section-overline">WORKLOAD</span><h3>Verteilung nach Status</h3><p>Aktuelle Bearbeitungsphase</p></div></div><SegmentedBars items={data.status.map((r) => ({ label: ({ open: 'Offen', in_progress: 'In Bearbeitung', resolved: 'Erledigt' })[r.status as 'open' | 'in_progress' | 'resolved'] ?? r.status, value: r.count }))} /></section><section className="panel chart-panel"><div className="panel-heading"><div><span className="section-overline">ACCOUNTS</span><h3>Aktivste Kunden</h3><p>Nach Anzahl eingegangener Tickets</p></div></div><SegmentedBars items={data.top_customers.map((c) => ({ label: c.company, value: c.tickets_count ?? 0 }))} palette={['#39b8ab', '#6a6beb', '#97a4fa', '#f3b870', '#ab93f0', '#91c3b5']} /></section></div>
    <section className="panel team-report"><div className="panel-heading"><div><span className="section-overline">TEAM</span><h3>Team-Auslastung</h3><p>Offene und zugewiesene Anfragen je Mitarbeiter</p></div></div><div className="team-report-list">{data.team.map((u) => <div key={u.id}><div className="team-name"><span className="team-initial">{u.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}</span><div><strong>{u.name}</strong><small>{u.role === 'admin' ? 'Administrator' : u.role === 'agent' ? 'Support Agent' : 'Lesezugriff'}</small></div></div><div className="team-work"><div><div style={{ width: `${Math.max(0, Math.min(100, (u.assigned_count ?? 0) * 10))}%` }} /></div><span>{u.assigned_count ?? 0} offen</span></div></div>)}</div></section>
    <p className="data-disclaimer"><Info size={15} /> Die Zahlen beruhen auf synthetischen Demo-Daten. Es werden keine externen Analysedienste eingesetzt.</p></>}
  </>;
}
