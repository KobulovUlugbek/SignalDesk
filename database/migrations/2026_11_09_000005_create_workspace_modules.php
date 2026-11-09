<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 180);
            $table->text('description')->nullable();
            $table->string('status', 20)->default('todo');
            $table->string('priority', 20)->default('medium');
            $table->date('due_date')->nullable();
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('ticket_id')->nullable()->constrained('tickets')->nullOnDelete();
            $table->timestamps();
            $table->index(['status', 'due_date']);
        });
        Schema::create('articles', function (Blueprint $table): void {
            $table->id();
            $table->string('title', 180);
            $table->string('category', 60);
            $table->longText('body');
            $table->boolean('published')->default(false);
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
        Schema::create('automations', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 140);
            $table->string('trigger', 40)->default('ticket_created');
            $table->string('condition_priority', 20)->default('any');
            $table->string('action', 40)->default('set_in_progress');
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('enabled')->default(true);
            $table->timestamps();
        });
        Schema::create('ticket_notes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('body');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_notes');
        Schema::dropIfExists('automations');
        Schema::dropIfExists('articles');
        Schema::dropIfExists('tasks');
    }
};
