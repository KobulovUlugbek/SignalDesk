<?php

namespace Tests\Feature;

use App\Models\Automation;
use App\Models\Customer;
use App\Models\Task;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkspaceTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role = 'admin'): User
    {
        return User::create(['name' => 'Tester', 'email' => $role.'@example.test', 'password' => 'Pass123456!', 'role' => $role]);
    }

    public function test_anonymous_visitors_cannot_read_customer_data(): void
    {
        $this->getJson('/api/customers')->assertUnauthorized();
    }

    public function test_login_and_session(): void
    {
        $this->user();
        $this->postJson('/api/auth/login', ['email' => 'admin@example.test', 'password' => 'Pass123456!'])
            ->assertOk()->assertJsonPath('user.role', 'admin');
        $this->getJson('/api/auth/session')->assertJsonPath('user.email', 'admin@example.test');
    }

    public function test_viewer_cannot_create_tickets(): void
    {
        $this->actingAs($this->user('viewer'));
        $customer = Customer::create(['name' => 'Client', 'company' => 'Acme', 'email' => 'client@example.test']);
        $this->postJson('/api/tickets', ['customer_id' => $customer->id, 'subject' => 'New request', 'description' => 'Valid description of this request', 'priority' => 'high'])->assertForbidden();
    }

    public function test_creating_ticket_runs_automation_and_records_activity(): void
    {
        $this->actingAs($this->user());
        $customer = Customer::create(['name' => 'Client', 'company' => 'Acme', 'email' => 'client@example.test']);
        Automation::create(['name' => 'Urgent escalation', 'trigger' => 'ticket_created', 'condition_priority' => 'urgent', 'action' => 'set_in_progress', 'enabled' => true]);
        $this->postJson('/api/tickets', ['customer_id' => $customer->id, 'subject' => 'Service has stopped', 'description' => 'Production requests fail for all users', 'priority' => 'urgent'])
            ->assertCreated()->assertJsonPath('data.status', 'in_progress');
        $this->assertDatabaseCount('tickets', 1);
        $this->assertDatabaseCount('activity_events', 2);
        $this->assertTrue(Ticket::first()->due_at->isFuture());
    }

    public function test_notes_and_task_lifecycle(): void
    {
        $this->actingAs($this->user());
        $customer = Customer::create(['name' => 'Client', 'company' => 'Acme', 'email' => 'client@example.test']);
        $ticket = Ticket::create(['customer_id' => $customer->id, 'subject' => 'Service issue', 'description' => 'Production API issue', 'priority' => 'high', 'status' => 'open', 'due_at' => now()->addHours(8)]);
        $this->postJson('/api/tickets/'.$ticket->id.'/notes', ['body' => 'Investigating incident'])->assertCreated();
        $this->getJson('/api/tickets/'.$ticket->id)->assertJsonCount(1, 'data.notes');
        $id = $this->postJson('/api/tasks', ['title' => 'Review incident'])->assertCreated()->json('data.id');
        $this->patchJson('/api/tasks/'.$id, ['status' => 'done'])->assertOk()->assertJsonPath('data.status', 'done');
        $this->deleteJson('/api/tasks/'.$id)->assertOk();
        $this->assertSame(0, Task::count());
    }

    public function test_only_admin_can_manage_automations(): void
    {
        $this->actingAs($this->user('agent'));
        $this->postJson('/api/automations', ['name' => 'Rule', 'condition_priority' => 'urgent', 'action' => 'set_in_progress'])->assertForbidden();
    }

    public function test_ticket_input_is_validated(): void
    {
        $this->actingAs($this->user());
        $this->postJson('/api/tickets', ['customer_id' => 999, 'subject' => 'x', 'description' => 'bad', 'priority' => 'critical'])->assertUnprocessable();
    }
}
