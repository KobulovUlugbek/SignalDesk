<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Automation;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAs(User::create(['name' => 'Admin', 'email' => 'admin@demo.test', 'password' => 'Pass123456!', 'role' => 'admin']));
    }

    public function test_customer_can_be_created_and_updated(): void
    {
        $id = $this->postJson('/api/customers', ['company' => 'Acme', 'name' => 'Sophie', 'email' => 'sophie@acme.test', 'plan' => 'Business'])->assertCreated()->json('data.id');
        $this->patchJson('/api/customers/'.$id, ['plan' => 'Enterprise'])->assertOk()->assertJsonPath('data.plan', 'Enterprise');
        $this->getJson('/api/customers')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_customer_email_must_be_unique(): void
    {
        $data = ['company' => 'Acme', 'name' => 'Sophie', 'email' => 'sophie@acme.test'];
        Customer::create($data);
        $this->postJson('/api/customers', [...$data, 'company' => 'Other'])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_articles_have_publishable_lifecycle(): void
    {
        $id = $this->postJson('/api/articles', ['title' => 'API Zugang sicher einrichten', 'category' => 'Sicherheit', 'body' => 'Diese ausführliche Anleitung erklärt, wie man API-Zugänge sicher einrichtet.', 'published' => false])->assertCreated()->json('data.id');
        $this->patchJson('/api/articles/'.$id, ['published' => true])->assertOk()->assertJsonPath('data.published', true);
        $this->getJson('/api/articles')->assertOk()->assertJsonCount(1, 'data');
        $this->deleteJson('/api/articles/'.$id)->assertOk();
        $this->assertSame(0, Article::count());
    }

    public function test_automation_can_assign_new_ticket_to_agent(): void
    {
        $agent = User::create(['name' => 'Sophie', 'email' => 'sophie@demo.test', 'password' => 'Pass123456!', 'role' => 'agent']);
        Automation::create(['name' => 'High priority routing', 'trigger' => 'ticket_created', 'condition_priority' => 'high', 'action' => 'assign_agent', 'assignee_id' => $agent->id, 'enabled' => true]);
        $customer = Customer::create(['name' => 'Client', 'company' => 'Acme', 'email' => 'client@demo.test']);
        $this->postJson('/api/tickets', ['customer_id' => $customer->id, 'subject' => 'Payment API is broken', 'description' => 'The payment gateway fails for all users.', 'priority' => 'high'])
            ->assertCreated()->assertJsonPath('data.assignee.id', $agent->id);
    }

    public function test_disabled_rule_does_not_run(): void
    {
        Automation::create(['name' => 'Off rule', 'trigger' => 'ticket_created', 'condition_priority' => 'urgent', 'action' => 'set_in_progress', 'enabled' => false]);
        $customer = Customer::create(['name' => 'Client', 'company' => 'Acme', 'email' => 'client@demo.test']);
        $this->postJson('/api/tickets', ['customer_id' => $customer->id, 'subject' => 'Production API broken', 'description' => 'API requests return errors for customers', 'priority' => 'urgent'])
            ->assertCreated()->assertJsonPath('data.status', 'open');
    }

    public function test_full_text_search_returns_matching_results(): void
    {
        Customer::create(['name' => 'Client', 'company' => 'Northstar Labs', 'email' => 'client@demo.test']);
        $this->getJson('/api/search?q=Northstar')->assertOk()->assertJsonCount(1, 'data.customers');
    }

    public function test_csv_export_responds_with_attachment(): void
    {
        $this->get('/api/export/tickets')->assertOk()->assertHeader('content-disposition', 'attachment; filename=signaldesk-tickets.csv');
    }

    public function test_profile_can_be_updated(): void
    {
        $this->patchJson('/api/auth/profile', ['name' => 'New Name'])->assertOk()->assertJsonPath('user.name', 'New Name');
    }
}
