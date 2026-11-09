# KI-Workflow und Review

Dieses Projekt wurde mit Unterstützung von **ChatGPT (GPT-6)** aus einer fachlichen Aufgabenstellung entwickelt. Ziel war nicht, Code ohne Prüfung zu übernehmen, sondern ein nachvollziehbares Laravel-/React-System zu konzipieren.

## Arbeitsprozess

1. Anforderungen der Stellenbeschreibung von InnoGE aufgenommen: Laravel, React, Tailwind CSS, strukturierte Architektur, Agentic Coding, Tests, Security und eigenständige technische Entscheidungen.
2. Bestehende kleinere Support-Demo analysiert und zu einem modularen Customer-Operations-System ausgebaut.
3. Datenbankmodell, Rollen und API-Routen festgelegt; Transaktionen und Automationsregeln im Backend implementiert.
4. React-Views und ein einheitliches CSS-Designsystem erstellt.
5. PHP-Syntaxprüfungen und TypeScript-Syntaxparser ausgeführt; fehlende Systemabhängigkeiten als Einschränkung dokumentiert.
6. Lokale Builds, Integrationstests, Usability, technische Code-Reviews und weitere Iterationen müssen vor dem Bewerbungsgespräch durch den Bewerber erfolgen.

## Welche KI-Werkzeuge wurden wirklich eingesetzt?

- ChatGPT als Coding- und Architekturassistent.
- Keine bestätigte Cursor-/Claude-Code-/Codex-Nutzung in dieser Auslieferung.
- Keine KI-Aufrufe beim regulären Betrieb der Anwendung.

## Kontrollpunkte vor dem Gespräch

- Verstehen, welche Endpunkte mit `can:write` und `can:admin` geschützt sind.
- Überprüfen, wann die Automationsregeln innerhalb einer Transaktion ausgelöst werden.
- Feature-Tests und TypeScript-Build lokal ausführen.
- Login/Logout sowie ungültige Requests und leere Listen im Browser testen.
- Kritisch überlegen: What happens if two agents edit the same ticket? Was wäre nötig für Multi-Tenancy und idempotente Worker?
