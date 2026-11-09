import { useCallback, useEffect, useState } from 'react';
import { Activity, ArrowRight, Bell, BookOpen, ChartColumnIncreasing, CheckCircle2, ChevronDown, Headphones, Kanban, LayoutDashboard, LogOut, Menu, Search, Settings2, ShieldCheck, Sparkles, TicketCheck, UsersRound, X, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api, ApiError } from './lib/api';
import type { Customer, Dashboard, SearchResult, Ticket, User, View } from './lib/types';
import { Avatar, ErrorBanner, relative, Spinner } from './components/Ui';
import Overview from './views/Overview';
import Tickets from './views/Tickets';
import Tasks from './views/Tasks';
import Customers from './views/Customers';
import Analytics from './views/Analytics';
import Knowledge from './views/Knowledge';
import Automations from './views/Automations';
import ActivityPage from './views/Activity';
import Settings from './views/Settings';

const navPrimary: { id: View; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Übersicht', icon: LayoutDashboard },
  { id: 'tickets', label: 'Ticket-Center', icon: TicketCheck },
  { id: 'tasks', label: 'Aufgaben-Board', icon: Kanban },
  { id: 'customers', label: 'Kunden / CRM', icon: UsersRound },
  { id: 'analytics', label: 'Analytics', icon: ChartColumnIncreasing },
];
const navSecondary: { id: View; label: string; icon: LucideIcon }[] = [
  { id: 'knowledge', label: 'Wissensdatenbank', icon: BookOpen },
  { id: 'automations', label: 'Automatisierungen', icon: Zap },
  { id: 'activity', label: 'Aktivitätsprotokoll', icon: Activity },
  { id: 'settings', label: 'Einstellungen', icon: Settings2 },
];
const views = [...navPrimary, ...navSecondary];

function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('admin@signaldesk.test');
  const [password, setPassword] = useState('SignalDesk2026!');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try { onLogin(await api.login(email, password)); }
    catch (err) { setError(err instanceof ApiError ? Object.values(err.errors).flat()[0] ?? err.message : 'Anmeldung fehlgeschlagen'); }
    finally { setBusy(false); }
  };
  return <div className="login-shell"><div className="login-visual"><div className="login-grid-pattern" /><div className="login-visual-top"><div className="brand-mark"><span /><span /><span /><span /></div><strong>signaldesk<span>.</span></strong></div><div className="login-visual-content"><span className="login-pill"><Sparkles size={15} /> CUSTOMER OPERATIONS STUDIO</span><h1>Weniger Chaos.<br /><em>Mehr Klarheit.</em></h1><p>Ein Workspace für Kunden, Tickets, Aufgaben und Automatisierungen. Alles vernetzt. Alles im Blick.</p><div className="login-widget"><div><span className="widget-dot" /> Heute im Überblick <span className="widget-right">LIVE</span></div><div className="login-widget-bars">{[42, 60, 39, 71, 58, 86, 63, 92, 76, 96, 66, 82].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}</div><div className="login-widget-bottom"><span>Service Performance</span><strong>+ 24.8 % ↗</strong></div></div></div><div className="login-visual-bottom">ENTWICKELT MIT LARAVEL · REACT · TYPESCRIPT <span>© 2026 SIGNALDESK</span></div></div><div className="login-main"><div className="login-content"><span className="login-sm-logo"><span className="brand-mark"><span /><span /><span /><span /></span> signaldesk.</span><div className="login-welcome"><span className="eyebrow">WILLKOMMEN ZURÜCK</span><h2>Schön, dass du da bist.</h2><p>Melde dich in deinem Workspace an, um loszulegen.</p></div><form onSubmit={submit} className="login-form">{error && <ErrorBanner message={error} />}<label><span>E-Mail-Adresse</span><input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@unternehmen.de" /></label><label><span>Passwort</span><input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label><button className="btn btn-primary login-submit" disabled={busy}>{busy ? 'Anmeldung läuft ...' : 'Im Workspace anmelden'} <ArrowRight size={18} /></button></form><div className="demo-credentials"><div><ShieldCheck size={18} /><strong>Demo-Zugänge</strong><span>Nur fiktive Daten</span></div><button onClick={() => { setEmail('admin@signaldesk.test'); setPassword('SignalDesk2026!'); }}>Admin</button><button onClick={() => { setEmail('agent@signaldesk.test'); setPassword('SignalDesk2026!'); }}>Agent</button><button onClick={() => { setEmail('viewer@signaldesk.test'); setPassword('SignalDesk2026!'); }}>Viewer</button></div><p className="login-hint">Diese Anwendung ist eine technische Bewerbungsdemo. Keine echten Kundendaten verwenden.</p></div></div></div>;
}

function QuickSearch({ navigate, selectTicket, close }: { navigate: (view: View) => void; selectTicket: (id: number) => void; close: () => void }) {
  const [value, setValue] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (value.trim().length < 2) { setResults(null); return; } let active = true; const timer = window.setTimeout(() => { setBusy(true); api.search(value).then((rows) => { if (active) setResults(rows); }).catch(() => { if (active) setResults(null); }).finally(() => { if (active) setBusy(false); }); }, 220); return () => { active = false; window.clearTimeout(timer); }; }, [value]);
  const go = (view: View) => { navigate(view); close(); };
  return <div className="search-scrim" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}><div className="search-dialog" role="dialog" aria-modal="true" aria-label="Schnellsuche"><div className="search-dialog-top"><Search size={21} /><input autoFocus value={value} onChange={(e) => setValue(e.target.value)} placeholder="Tickets, Kunden, Artikel oder Bereiche suchen ..." /><button onClick={close}>ESC</button></div><div className="search-dialog-body">{value.length < 2 ? <><span className="search-caption">SCHNELLNAVIGATION</span>{views.map(({ id, label, icon: Icon }) => <button className="search-result" onClick={() => go(id)} key={id}><Icon size={18} /><span>{label}</span><ArrowRight size={15} /></button>)}</> : busy ? <Spinner label="Suche läuft ..." /> : <>{results && <><span className="search-caption">TICKETS</span>{results.tickets.map((t) => <button key={t.id} className="search-result" onClick={() => { selectTicket(t.id); close(); }}><TicketCheck size={18} /><span>{t.subject}</span><small>#{t.id}</small></button>)}<span className="search-caption">KUNDEN</span>{results.customers.map((c) => <button key={c.id} className="search-result" onClick={() => go('customers')}><UsersRound size={18} /><span>{c.company}</span><small>{c.plan}</small></button>)}<span className="search-caption">WISSENSDATENBANK</span>{results.articles.map((a) => <button key={a.id} className="search-result" onClick={() => go('knowledge')}><BookOpen size={18} /><span>{a.title}</span><small>{a.category}</small></button>)}</>}{results && !(results.tickets.length || results.customers.length || results.articles.length) && <p className="search-no-results">Keine Treffer gefunden.</p>}</>}</div><div className="search-dialog-footer"><span><kbd>⌘</kbd> + <kbd>K</kbd> öffnen</span><span>SignalDesk Suche</span></div></div></div>;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [view, setView] = useState<View>(() => { const hash = window.location.hash.slice(1) as View; return views.some((v) => v.id === hash) ? hash : 'overview'; });
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [loadError, setLoadError] = useState('');
  const [version, setVersion] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [openSignal, setOpenSignal] = useState(0);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('signaldesk-theme') === 'dark' ? 'dark' : 'light');
  const notify = useCallback((message: string) => setToast(message), []);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  const navigate = (target: View) => { setView(target); setMenuOpen(false); setNotificationsOpen(false); window.history.replaceState(null, '', `#${target}`); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const openTicket = (ticket: Ticket) => { setSelectedTicketId(ticket.id); navigate('tickets'); };
  const startTicket = () => { setSelectedTicketId(null); setOpenSignal((v) => v + 1); navigate('tickets'); };
  useEffect(() => { api.session().then(setUser).catch((e: Error) => setLoadError(e.message)).finally(() => setInitializing(false)); }, []);
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('signaldesk-theme', theme); }, [theme]);
  useEffect(() => { if (!user) return; let active = true; Promise.all([api.dashboard(), api.customers(), api.team()]).then(([dash, accounts, members]) => { if (active) { setDashboard(dash); setCustomers(accounts); setTeam(members); setLoadError(''); } }).catch((e: Error) => { if (active) setLoadError(e.message); }); return () => { active = false; }; }, [user?.id, version]);
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen((v) => !v); } if (e.key === 'Escape') { setSearchOpen(false); setNotificationsOpen(false); setMenuOpen(false); } }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, []);
  useEffect(() => { if (!user) return; const timer = window.setInterval(() => refresh(), 60_000); return () => window.clearInterval(timer); }, [user?.id, refresh]);
  useEffect(() => { if (!toast) return; const timeout = window.setTimeout(() => setToast(''), 4300); return () => window.clearTimeout(timeout); }, [toast]);
  const signOut = async () => { try { await api.logout(); setUser(null); setDashboard(null); setCustomers([]); setTeam([]); } catch (e) { notify(e instanceof Error ? e.message : 'Abmelden fehlgeschlagen'); } };
  if (initializing) return <div className="boot-screen"><div className="brand-mark"><span /><span /><span /><span /></div><Spinner label="Workspace wird geladen ..." /></div>;
  if (!user) return <Login onLogin={(value) => { setUser(value); setLoadError(''); refresh(); }} />;
  const writable = user.role !== 'viewer';
  return <div className="app-shell"><button className={`sidebar-shade ${menuOpen ? 'visible' : ''}`} onClick={() => setMenuOpen(false)} aria-label="Menü schließen" /><aside className={`app-sidebar ${menuOpen ? 'sidebar-open' : ''}`}><div className="sidebar-brand"><span className="brand-mark"><span /><span /><span /><span /></span><strong>signaldesk<span>.</span></strong><button onClick={() => setMenuOpen(false)} className="sidebar-mobile-close" aria-label="Menü schließen"><X size={20} /></button></div><div className="workspace-card"><div className="workspace-avatar">S</div><div><strong>SignalDesk Studio</strong><span>Demo Workspace <span className="workspace-online" /></span></div><ChevronDown size={16} /></div>
    <div className="nav-scroll"><p className="nav-caption">WORKSPACE</p><nav aria-label="Hauptnavigation" className="sidebar-menu">{navPrimary.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? 'nav-active' : ''} onClick={() => navigate(id)}><Icon size={18} strokeWidth={1.85} />{label}{id === 'tickets' && !!dashboard?.metrics.open_tickets && <span className="nav-bubble">{dashboard.metrics.open_tickets}</span>}</button>)}</nav><p className="nav-caption nav-caption-resources">TOOLS & RESSOURCEN</p><nav aria-label="Weitere Bereiche" className="sidebar-menu">{navSecondary.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? 'nav-active' : ''} onClick={() => navigate(id)}><Icon size={18} strokeWidth={1.85} />{label}{id === 'automations' && <span className="nav-new-dot" />}</button>)}</nav></div>
    <div className="sidebar-bottom"><div className="sidebar-help"><span><Headphones size={18} /></span><strong>Gebaut für echte Workflows.</strong><p>Eine interaktive Demo mit Laravel, React und TypeScript.</p><a href="https://ulugbek-kobulov.com" target="_blank" rel="noreferrer">Entwickler-Portfolio <ArrowRight size={15} /></a></div><button className="sidebar-user" onClick={() => navigate('settings')}><Avatar name={user.name} /><span><strong>{user.name}</strong><small>{user.role === 'admin' ? 'Workspace Admin' : user.role === 'agent' ? 'Support Agent' : 'Read-only'}</small></span><Settings2 size={17} /></button></div></aside>
    <div className="app-content min-w-0 flex-1"><header className="topbar"><div className="topbar-breadcrumb"><button className="mobile-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Menü öffnen"><Menu size={21} /></button><span>Workspace</span><ChevronRightMini /><strong>{views.find((item) => item.id === view)?.label}</strong></div><div className="topbar-actions flex items-center"><button className="topbar-search" onClick={() => setSearchOpen(true)}><Search size={17} /><span>Suchen oder Befehl ...</span><kbd>⌘ K</kbd></button><div className="topbar-divider" /><span className="topbar-health"><span /> All systems operational</span><button className="topbar-icon" aria-label="Benachrichtigungen" onClick={() => setNotificationsOpen((v) => !v)}><Bell size={19} /><i /></button><button className="topbar-profile" onClick={() => navigate('settings')}><Avatar name={user.name} size="small" /><span>{user.name.split(' ')[0]}</span><ChevronDown size={15} /></button></div>{notificationsOpen && <div className="notifications-pop"><div><strong>Aktuelle Aktivitäten</strong><button onClick={() => setNotificationsOpen(false)}><X size={16} /></button></div>{dashboard?.activity.slice(0, 4).map((entry) => <button key={entry.id} onClick={() => navigate('activity')}><span className="notification-dot" /><span>{entry.detail}<small>{relative(entry.created_at)}</small></span></button>)}<button className="notification-link" onClick={() => navigate('activity')}>Alle Aktivitäten ansehen <ArrowRight size={14} /></button></div>}</header>
      <main className="main-pane">{loadError && <ErrorBanner message={loadError} retry={refresh} />}{view === 'overview' && (dashboard ? <Overview dashboard={dashboard} navigate={navigate} openTicket={openTicket} create={startTicket} writable={writable} username={user.name} /> : <Spinner />)}{view === 'tickets' && <Tickets customers={customers} team={team} writable={writable} notify={notify} refresh={refresh} openSignal={openSignal} onOpen={() => setOpenSignal(0)} initialTicketId={selectedTicketId} onTicketClose={() => setSelectedTicketId(null)} />}{view === 'tasks' && <Tasks team={team} writable={writable} notify={notify} refresh={refresh} />}{view === 'customers' && <Customers writable={writable} notify={notify} refresh={refresh} />}{view === 'analytics' && <Analytics />}{view === 'knowledge' && <Knowledge writable={writable} notify={notify} refresh={refresh} />}{view === 'automations' && <Automations team={team} admin={user.role === 'admin'} notify={notify} refresh={refresh} />}{view === 'activity' && <ActivityPage />}{view === 'settings' && <Settings user={user} team={team} theme={theme} setTheme={setTheme} onProfile={setUser} notify={notify} />}<footer className="app-footer"><span>© 2026 SignalDesk Studio · Portfolio Demo</span><span><ShieldCheck size={14} /> Laravel 12 · React 19 · TypeScript <button onClick={signOut}><LogOut size={14} /> Abmelden</button></span></footer></main></div>
    {searchOpen && <QuickSearch navigate={navigate} close={() => setSearchOpen(false)} selectTicket={(id) => { setSelectedTicketId(id); navigate('tickets'); }} />}{toast && <div className="toast"><CheckCircle2 size={18} /><span>{toast}</span><button onClick={() => setToast('')} aria-label="Schließen"><X size={15} /></button></div>}
  </div>;
}
function ChevronRightMini() { return <span className="breadcrumb-chevron">/</span>; }
