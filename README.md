# SignalDesk Studio

**Customer Operations Platform · Laravel 12 + React 19 + TypeScript**

Ein eigenständiges Fullstack-Bewerbungsprojekt für InnoGE, erstellt von **Ulugbek Kobulov** mit KI-Unterstützung. Die Demo zeigt ein integriertes Kundenservice-System mit echter Datenbank, durchgängigen REST-Endpunkten, serverseitiger Geschäftslogik, Tests und einer responsiven React-Oberfläche. Alle Demo-Daten sind **synthetisch**.

## 1. Schnellstart

**Voraussetzungen:** Node.js **20.19+**, npm, PHP **8.2+** inkl. `pdo_sqlite`, `mbstring`, `dom`, `xml`, `fileinfo`, `openssl`, Composer **2**.

```bash
npm install
npm run doctor
npm run setup
npm run dev
```

App: **http://127.0.0.1:8000** (Laravel-URL, **nicht** Vite-Port 5173).

> **Wichtig:** `npm install` installiert die React-/Vite-Pakete. `npm run setup` verwendet Composer für Laravel, erzeugt `.env`, erstellt SQLite und führt Migrationen sowie Seed-Daten aus. Nur npm allein reicht nicht für PHP. `npm run setup` kann erneut ausgeführt werden, ohne Daten oder `APP_KEY` zurückzusetzen.

### Demo-Logins

| Rolle | E-Mail | Passwort | Rechte |
|---|---|---|---|
| Admin | `admin@signaldesk.test` | `SignalDesk2026!` | Alle Funktionen inkl. Automationsverwaltung |
| Agent | `agent@signaldesk.test` | `SignalDesk2026!` | Lesen und Bearbeiten, keine Regelverwaltung |
| Viewer | `viewer@signaldesk.test` | `SignalDesk2026!` | Nur Lesen |

Die Accounts sind **explizit nur für die Demo**. Für eine öffentlich erreichbare Installation sind individuelle Zugangsdaten, sichere Passwortverwaltung und zusätzliche Schutzmaßnahmen nötig. Niemals echte Kundendaten mit diesen Accounts verarbeiten.

## 2. Funktionsübersicht

| Bereich | Funktionen | Laravel-Backend |
|---|---|---|
| Dashboard | KPI-Karten, SLA-Warnungen, Prioritäten, Trends, Aktivitätsfeed | Aggregationen + Eloquent |
| Ticket-Center | Anlegen, Suche, Filter, Paging, Status/Priorität/Agent ändern, interne Notizen | Controller, FormRequest, Service, Transaktionen |
| Aufgaben-Board | Kanban mit Drag & Drop, Erstellen, Bearbeiten, Löschen, Termine & Zuweisungen | REST-CRUD + Audit |
| Kunden / CRM | Kontakte, Ansprechpartner, Plan, Branche, Status & interne Notizen | REST-CRUD + Validierung |
| Analytics | Volumen, Kanäle, Bearbeitungsstatus, Top-Kunden, Mitarbeiter-Workload | SQL-Aggregationen |
| Wissensdatenbank | Volltextsuche, Kategorien, Artikel, Entwurf/Veröffentlichen, Bearbeiten | REST-CRUD |
| Automations-Engine | Prioritätsabhängige Ticket-Regeln, Aktivierung, Zuweisung, Statusänderung | `AutomationEngine` läuft bei Ticket-Erstellung |
| Audit Trail | Historie nach Entität, Pagination, Actor und Zeitstempel | `ActivityLogger` |
| Einstellungen | Profil bearbeiten, Dark Mode, Rollen/Team | Auth/Session und User-API |
| Global Search | `Cmd/Ctrl + K`, Treffer aus Tickets, Kunden und Artikeln | Validierter Search-Endpoint |
| CSV Export | Ticketdaten für Tabellenexport | Server Stream + Formula-Injection-Abwehr |

Weitere Details in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 3. Architektur

```text
React + TypeScript + Vite + Tailwind CSS
     │
     │ Session Cookie + X-CSRF-TOKEN
     ▼
Laravel 12 REST API → Authentication / Gate: can(write), can(admin)
     │
     ├── FormRequest / Request Validation
     ├── Controller → Eloquent Models
     ├── TicketWorkflow → Database Transactions + SLA
     ├── AutomationEngine → Rule Evaluation
     ├── ActivityLogger → Audit Events
     └── SQLite (Demo) / erweiterbar auf PostgreSQL oder MySQL
```

Backend-Logik liegt im `app/`-Verzeichnis. React-Views sind in `resources/js/views/` getrennt, getypte Datenmodelle in `resources/js/lib/types.ts`, API-Client in `resources/js/lib/api.ts`. Die UI nutzt eigene Komponenten und ein konsistentes CSS-Designsystem; Tailwind CSS ist eingebunden.

### API-Überblick

- `GET /api/auth/session`, `POST /api/auth/login`, `POST /api/auth/logout`, `PATCH /api/auth/profile`
- `GET /api/dashboard`, `GET /api/analytics`, `GET /api/activity`, `GET /api/search`, `GET /api/team`
- `GET /api/tickets`, `GET /api/tickets/{id}`, `POST /api/tickets`, `PATCH /api/tickets/{id}`, `POST /api/tickets/{id}/notes`
- `GET /api/customers`, `POST /api/customers`, `PATCH /api/customers/{id}`
- `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/{id}`, `DELETE /api/tasks/{id}`
- `GET /api/articles`, `POST /api/articles`, `PATCH /api/articles/{id}`, `DELETE /api/articles/{id}`
- `GET /api/automations`, `POST /api/automations`, `PATCH /api/automations/{id}`, `DELETE /api/automations/{id}`
- `GET /api/export/tickets`, `GET /up`

> Alle betriebsinternen API-Endpunkte benötigen Authentifizierung. Änderungen erfordern Agent- oder Admin-Rechte; Automationsverwaltung zusätzlich Admin. Die Anwendung arbeitet mit Cookie-Session und CSRF-Token.

## 4. Tests & Codequalität

```bash
npm run typecheck
npm run build
php artisan test
```

Feature-Tests prüfen Login/Session, geschützte API-Routen, Viewer-Rechte, Eingabevalidierung, Tickets inkl. SLA und aktivierter Automationsregel, Audit-Einträge, interne Notizen und Task-CRUD. GitHub Actions führt PHP-Tests und den TypeScript/Vite-Build bei Pull Requests aus.

**Verifikationsstand:** PHP-Dateien wurden auf Syntax geprüft und TypeScript-Dateien erfolgreich geparst. Ein vollständiger Composer-Install, Browser-Integrationstest und Produktionsbuild waren in der Generierungsumgebung nicht möglich, weil Composer, notwendige PHP-Erweiterungen und Internetzugriff auf Paketregistries fehlten. Bitte die obigen Checks lokal ausführen und Fehler beheben, bevor du die Anwendung veröffentlichst. Die Behauptung, sie sei vollständig E2E-getestet, wäre aktuell nicht zutreffend.

## 5. Docker / online bereitstellen

```bash
npm run setup
npm run build

docker compose up --build
```

Lokal via **http://localhost:8080**. Ein persistentes SQLite-Volume hält die Demo-Daten. Der Dockerfile enthält ein Multi-Stage-Build für Composer + Node-Assets und einen Apache-PHP-Server.

Für einen Cloud-Docker-Host (z. B. Railway, Render, eigener VPS):

1. Repository deployen und `Dockerfile` verwenden.
2. `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://<domain>`, `APP_KEY=<secret>` setzen.
3. SQLite nur mit persistentem Volume verwenden; andernfalls Datenbank auf PostgreSQL/MySQL umstellen.
4. HTTPS, `SESSION_SECURE_COOKIE=true`, sichere Login-Daten und idealerweise einen vorgeschalteten Zugriffsschutz aktivieren.
5. **Nur Testdaten** verwenden und alle Zugänge vor einer öffentlichen Freigabe ersetzen.

Für `APP_KEY` kann nach lokalem Composer-Setup `php artisan key:generate --show` ausgeführt werden. Die Variable nicht in Git hochladen.

## 6. GitHub-Bewerbung bei InnoGE

1. Projekt lokal installieren, alle Views und Änderungen prüfen und Tests ausführen.
2. Eigenes GitHub-Repository erstellen und den Quellcode pushen. Keine `.env`, keine Datenbankdatei, keine Zugangsdaten aus Produktion committen.
3. Tim Geisendörfer auf GitHub unter **`@geisi`** zum Repository einladen.
4. Repo-Link im Bewerbungsformular eintragen und optional eine abgesicherte Online-Demo ergänzen.
5. Im Gespräch Laravel-Routen, FormRequests, Workflow-Service, Automationsregel und UI-Code erläutern und eine kleine Änderung live vorführen können.

## 7. KI-Workflow, Entscheidungen und Grenzen

- **KI-Unterstützung:** ChatGPT wurde für Konzeption, initiale Implementierung, Strukturierung und Review-Hinweise verwendet. Der tatsächliche Tool-Einsatz wird transparent in [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md) beschrieben. Nicht behaupten, Cursor/Claude Code/Codex genutzt zu haben, wenn du das nicht selbst ausprobiert hast.
- **Architekturentscheidungen:** Session-basierte Anmeldung für browserinterne API; SQLite für Setup ohne extra Services; Services für deterministische Workflows; schlanke native Charts ohne externen Charting-Dienst.
- **Bekannte Grenzen:** Kein Multi-Tenancy, keine E-Mail-Verbindung, keine Live-WebSockets, keine Queues, kein echtes KI-Modell im Produkt, noch keine automatisierten Browser-Tests. Demo-Accounts sind hart codiert und dürfen nicht produktiv verwendet werden.

Siehe [docs/INTERVIEW.md](docs/INTERVIEW.md) für technische Erklärungen und Erweiterungsideen.

**Autor:** Ulugbek Kobulov · https://ulugbek-kobulov.com
