# Technische Architektur

- Laravel 12: Eloquent, FormRequests, Route-Model-Binding, Services, Gate-Berechtigungen und Session-Authentication.
- React 19 + TypeScript: funktionsorientierte Modulstruktur, zentrale API-Client-Schicht, konsistente Lade-/Fehlerzustände, kontrollierte Formulare.
- SQLite in der Demo: keine externe Datenbank erforderlich; in Produktion PostgreSQL oder MySQL möglich.
- Schreiboperationen laufen serverseitig über `can:write` oder `can:admin`. Anonyme Anfragen erhalten 401. CSRF schützt zustandsändernde Requests im Session-Modell.
- `TicketWorkflow` kapselt Statusübergänge und SLA-Berechnung in DB-Transaktionen.
- `AutomationEngine` wird bei der Ticketerstellung synchron innerhalb derselben Transaktion ausgeführt. Ein Regel-Fehler verhindert dadurch einen inkonsistenten Commit.
- `ActivityLogger` speichert Ticket-, CRM-, Task-, Artikel- und Regeländerungen in einem zentralen Activity Feed.
- Suchfilter werden validiert; Ticketlisten sind paginiert; relevante Relationen werden eager-loaded.
- CSV-Export schützt gegen Formula-Injection (Tabellenkalkulationssoftware).

## Bewusste Grenzen

- Single-Workspace-Demo, kein Multi-Tenant-Isolationsmodell.
- Keine E-Mail-Integration, keine Push-Notifications und keine WebSockets; Aktualisierung via manuellem Refresh und Polling.
- Sync-Automationsregeln statt Queue-Worker; für hohe Last sollten Jobs + idempotente Event-Handler verwendet werden.
- Demo-Zugangsdaten sind nur für synthetische Testdaten gedacht; öffentliches Deployment benötigt eigene Accounts, sichere Passwörter, HTTPS und ein Zugriffskonzept.
- Kein tatsächliches KI-Modell in der Laufzeit. Die Anwendung wurde mit KI-Unterstützung entwickelt, alle Geschäftsfunktionen sind deterministisch.
