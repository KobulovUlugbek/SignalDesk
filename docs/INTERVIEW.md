# InnoGE Interview-Vorbereitung

## Präsentation in 3 Minuten

1. **Problem:** Supportteams verlieren in mehreren Tools Kontext und Transparenz.
2. **Lösung:** SignalDesk Studio verbindet Tickets, Kunden, Aufgaben, Wissen und Regeln in einer Oberfläche.
3. **Backend:** Laravel-Routen, FormRequests, Policies über Gates, Eloquent, Transaktionen, SLA-Workflow und Audit.
4. **Frontend:** React + TypeScript, modulare Views, globale Suche, Zustandstrennung, responsive Oberfläche, Dark Mode.
5. **Trade-offs:** SQLite statt Datenbankserver, synchroner Regel-Engine statt Queue, bewusst keine Echtzeit/WebSockets.

## Live-Demo

- Als Admin anmelden und ein dringendes Ticket anlegen. Nachsehen, ob die Regel den Status auf „In Bearbeitung“ setzt.
- Ticket öffnen, internen Kommentar hinzufügen und Zuständigen ändern.
- Aufgabe im Kanban verschieben; Analytics und Activity-Log zeigen.
- Als Viewer anmelden und zeigen, dass Schreibrechte nicht nur in der UI, sondern in Laravel verweigert werden.
- `php artisan test` und `npm run build` demonstrieren, sobald lokal ausgeführt.

## Technische Fragen

**Warum Serviceklassen?** Trennung zwischen HTTP-Transport und Domänenlogik, Wiederverwendbarkeit, isolierbare Tests.

**Warum Transaktionen?** Ticket-Anlage, Automation-Ausführung und Audit-Ereignisse sollen entweder gemeinsam erfolgreich sein oder zurückgerollt werden.

**Warum Sessions statt JWT?** Für eine First-Party-Browser-Anwendung genügt ein HttpOnly Session-Cookie mit CSRF-Schutz. Für externe APIs würden Token-basierte Authentifizierung und getrennte Scopes Sinn ergeben.

**Was würdest du für Produktion ergänzen?** Tenant-Scope pro Request/Model, Queue-Worker, optimierte Indizes, Monitoring, Sentry, E2E-Test-Suite, Secrets Management, Deployment-Pipeline, eindeutige Domain-Events.

**Wie setzt du Coding-Agenten ein?** Anforderungen eingrenzen, Tests und Akzeptanzkriterien definieren, kleine sinnvolle Changesets generieren, Diff lesen, Sicherheitsfälle prüfen, Tests ausführen, Ergebnis manuell validieren.
