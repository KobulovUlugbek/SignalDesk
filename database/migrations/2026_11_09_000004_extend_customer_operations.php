<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            $table->string('industry', 80)->nullable();
            $table->string('phone', 40)->nullable();
            $table->text('notes')->nullable();
        });
        Schema::table('tickets', function (Blueprint $table): void {
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('category', 40)->default('technical');
        });
        Schema::table('activity_events', function (Blueprint $table): void {
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('entity_type', 30)->default('ticket');
            $table->unsignedBigInteger('entity_id')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('activity_events', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('actor_id');
            $table->dropColumn(['entity_type', 'entity_id']);
        });
        Schema::table('tickets', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('assignee_id');
            $table->dropColumn('category');
        });
        Schema::table('customers', fn (Blueprint $table) => $table->dropColumn(['industry', 'phone', 'notes']));
    }
};
