<?php

namespace Database\Seeders;

use App\Models\ActivityEvent;
use App\Models\Article;
use App\Models\Automation;
use App\Models\Customer;
use App\Models\Task;
use App\Models\Ticket;
use App\Models\TicketNote;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (User::query()->exists()) {
            return;
        }

        DB::transaction(function (): void {
            $users = collect([
                ['name' => 'Alex Morgan', 'email' => 'admin@signaldesk.test', 'role' => 'admin'],
                ['name' => 'Sophie Keller', 'email' => 'agent@signaldesk.test', 'role' => 'agent'],
                ['name' => 'Jonas Weber', 'email' => 'jonas@signaldesk.test', 'role' => 'agent'],
                ['name' => 'Mia Hoffmann', 'email' => 'viewer@signaldesk.test', 'role' => 'viewer'],
            ])->map(fn (array $u) => User::create([...$u, 'password' => 'SignalDesk2026!']));
            $companies = [
                ['Sophie Wagner', 'Acme Cloud', 'sophie@acme.test', 'Enterprise', 'Cloud & Hosting'],
                ['Max Berger', 'Northstar Labs', 'max@northstar.test', 'Business', 'Software'],
                ['Elena Fischer', 'Velo Digital', 'elena@velo.test', 'Business', 'Agentur'],
                ['Jonas Richter', 'Orbit Commerce', 'jonas@orbit.test', 'Enterprise', 'E-Commerce'],
                ['Mila Hoffmann', 'Studio Forma', 'mila@forma.test', 'Starter', 'Design'],
                ['Daniel Weber', 'Nova Systems', 'daniel@nova.test', 'Business', 'IT-Services'],
                ['Lea Krüger', 'Helio Energy', 'lea@helio.test', 'Enterprise', 'Energie'],
                ['Nico Hartmann', 'Atlas Logistics', 'nico@atlas.test', 'Business', 'Logistik'],
                ['Emma Schulz', 'Pixelhaus', 'emma@pixelhaus.test', 'Starter', 'Kreativagentur'],
                ['Paul Braun', 'Summit Finance', 'paul@summit.test', 'Enterprise', 'Fintech'],
                ['Lina Wolf', 'Boreal Health', 'lina@boreal.test', 'Business', 'Health Tech'],
                ['Tim Neumann', 'Mono Studio', 'tim@mono.test', 'Starter', 'Design'],
            ];
            $customers = collect($companies)->map(fn ($c, $i) => Customer::create([
                'name' => $c[0], 'company' => $c[1], 'email' => $c[2], 'plan' => $c[3],
                'industry' => $c[4], 'phone' => '+49 30 5550 '.str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
                'status' => $i === 11 ? 'paused' : 'active',
                'notes' => $i === 0 ? 'Strategischer Account · Bevorzugte Kommunikation per E-Mail.' : null,
            ]));
            $subjects = [
                ['Produktiv-API liefert 503-Fehler', 'urgent', 'technical'],
                ['SSL-Zertifikat kann nicht verlängert werden', 'high', 'technical'],
                ['Speicher-Kontingent erweitern', 'medium', 'account'],
                ['Instabile Datenbankverbindungen', 'urgent', 'technical'],
                ['Eigene Domain konfigurieren', 'low', 'account'],
                ['API-Token Berechtigungen prüfen', 'medium', 'technical'],
                ['Rechnung stimmt nicht mit Vertrag überein', 'medium', 'billing'],
                ['DNS-Records werden nicht aufgelöst', 'high', 'technical'],
                ['Automatische Backups aktivieren', 'low', 'feature'],
                ['Webhooks werden nicht zugestellt', 'high', 'technical'],
                ['Workspace-Migration vorbereiten', 'medium', 'account'],
                ['Audit-Logs exportieren', 'low', 'feature'],
                ['Login mit SSO nicht möglich', 'urgent', 'account'],
                ['Abrechnungsbericht für Q4 exportieren', 'medium', 'billing'],
                ['Hohe Latenz im Dashboard', 'high', 'technical'],
                ['Nutzerrollen im Portal anpassen', 'low', 'feature'],
                ['Falsche Zeitzone bei Benachrichtigungen', 'medium', 'feature'],
                ['Rate-Limit für Schnittstelle erhöhen', 'high', 'technical'],
                ['Kreditkartenzahlung schlägt fehl', 'urgent', 'billing'],
                ['Neue Mitarbeiter einladen', 'low', 'account'],
            ];
            foreach (range(0, 55) as $i) {
                [$subject, $priority, $category] = $subjects[$i % count($subjects)];
                $age = ($i * 7 + 3) % 325;
                $createdAt = now()->subHours($age)->subMinutes(($i * 11) % 60);
                $status = $i % 6 === 0 ? 'resolved' : ($i % 3 === 0 ? 'in_progress' : 'open');
                $sla = ['urgent' => 2, 'high' => 8, 'medium' => 24, 'low' => 72][$priority];
                $ticket = Ticket::forceCreate([
                    'customer_id' => $customers[$i % $customers->count()]->id,
                    'assignee_id' => $i % 4 === 0 ? null : $users[($i % 2) + 1]->id,
                    'subject' => $subject.($i >= 20 ? ' · #'.($i + 1) : ''),
                    'description' => 'Der Kunde meldet ein Problem im Produktivsystem. Bitte prüfen, Ursache eingrenzen, Lösung dokumentieren und Rückmeldung geben.',
                    'priority' => $priority,
                    'status' => $status,
                    'category' => $category,
                    'channel' => ['portal', 'email', 'chat', 'phone'][$i % 4],
                    'due_at' => $createdAt->copy()->addHours($sla),
                    'resolved_at' => $status === 'resolved' ? $createdAt->copy()->addHours(min($sla + 1, 6)) : null,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
                ActivityEvent::forceCreate([
                    'ticket_id' => $ticket->id, 'actor_id' => $users[1]->id,
                    'action' => $status === 'resolved' ? 'updated' : 'created',
                    'detail' => $status === 'resolved' ? 'Ticket gelöst: '.$ticket->subject : 'Ticket erstellt: '.$ticket->subject,
                    'entity_type' => 'ticket', 'entity_id' => $ticket->id,
                    'created_at' => $createdAt, 'updated_at' => $createdAt,
                ]);
                if ($i % 7 === 0) {
                    TicketNote::create(['ticket_id' => $ticket->id, 'user_id' => $users[1]->id, 'body' => 'Erste Analyse abgeschlossen. Der nächste Schritt ist die Prüfung der Server-Logs.']);
                }
            }
            $tasks = [
                ['API-Fehler im Gateway analysieren', 'doing', 'urgent', 0, 1],
                ['Release Notes für Version 2.4 vorbereiten', 'todo', 'medium', 2, null],
                ['Kundenfeedback zum Portal sammeln', 'todo', 'low', 5, null],
                ['SLA-Eskalationsprozess dokumentieren', 'doing', 'high', 1, 4],
                ['Neue Dashboard-Komponente testen', 'done', 'medium', -1, null],
                ['Automatisierten Smoke-Test einrichten', 'todo', 'high', 4, null],
                ['Monitoring-Alert optimieren', 'doing', 'medium', 3, 15],
                ['Wissensdatenbank aktualisieren', 'done', 'low', -2, null],
                ['Sicherheitscheck für Token-Scopes', 'todo', 'high', 2, 6],
                ['Onboarding für Enterprise-Kunden', 'todo', 'medium', 7, null],
                ['Support-Metriken für Q4 auswerten', 'done', 'medium', -3, null],
                ['Design-Review der Statusanzeigen', 'doing', 'low', 6, null],
            ];
            foreach ($tasks as $i => [$title, $status, $priority, $days, $ticket]) {
                Task::create(['title' => $title, 'description' => 'Klare Akzeptanzkriterien prüfen und das Ergebnis im Team abstimmen.', 'status' => $status, 'priority' => $priority, 'due_date' => now()->addDays($days)->toDateString(), 'assignee_id' => $users[($i % 2) + 1]->id, 'ticket_id' => $ticket]);
            }
            $articles = [
                ['API-Schlüssel sicher erstellen', 'Sicherheit', 'API-Schlüssel werden im Kundenportal unter Einstellungen erstellt. Achte darauf, jedem Schlüssel nur die benötigten Berechtigungen zu geben. Für Produktionsanwendungen empfehlen wir eine regelmäßige Rotation und die sichere Ablage in einem Secrets Manager.'],
                ['Eigene Domain verbinden', 'Erste Schritte', 'Lege zuerst einen CNAME-Eintrag bei deinem DNS-Anbieter an. Warte auf die Verbreitung des Eintrags und prüfe danach den Verifizierungsstatus im Kundenportal. Die SSL-Bereitstellung läuft anschließend automatisch.'],
                ['SLA-Prioritäten verstehen', 'Support', 'Dringend: 2 Stunden. Hoch: 8 Stunden. Mittel: 24 Stunden. Niedrig: 72 Stunden. Das System berechnet die Frist beim Erstellen eines Tickets und zeigt Überschreitungen separat an.'],
                ['Fehleranalyse bei HTTP 503', 'Troubleshooting', 'Prüfe zuerst den Status deiner Anwendung und alle relevanten Metriken. Analysiere anschließend die Gateway- und Anwendungsprotokolle. Bei Produktionsausfällen erstelle ein Ticket mit hoher oder dringender Priorität.'],
                ['Benutzerrollen und Zugriffsrechte', 'Sicherheit', 'Administratoren können alle Bereiche verwalten. Agents bearbeiten operative Datensätze. Viewer erhalten lesenden Zugriff. Unabhängig von der Benutzeroberfläche prüft das Backend bei jeder Änderung die notwendigen Berechtigungen.'],
                ['Einrichten von Benachrichtigungen', 'Erste Schritte', 'Aktiviere Benachrichtigungen im Kundenportal und lege fest, welche Ereignisse relevant sind. Achte bei geschäftskritischen Meldungen auf einen zweiten Eskalationsweg.'],
            ];
            foreach ($articles as $i => [$title, $category, $body]) {
                Article::create(['title' => $title, 'category' => $category, 'body' => $body, 'published' => $i !== 5, 'author_id' => $users[1]->id]);
            }
            Automation::create(['name' => 'Dringende Anfragen sofort bearbeiten', 'trigger' => 'ticket_created', 'condition_priority' => 'urgent', 'action' => 'set_in_progress', 'enabled' => true]);
            Automation::create(['name' => 'Hohe Priorität an Sophie zuweisen', 'trigger' => 'ticket_created', 'condition_priority' => 'high', 'action' => 'assign_agent', 'assignee_id' => $users[1]->id, 'enabled' => true]);
            Automation::create(['name' => 'Neue Standardfälle automatisch zuweisen', 'trigger' => 'ticket_created', 'condition_priority' => 'medium', 'action' => 'assign_agent', 'assignee_id' => $users[2]->id, 'enabled' => false]);
        });
    }
}
