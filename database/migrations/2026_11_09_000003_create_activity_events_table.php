<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('ticket_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 40);
            $table->string('detail', 240);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_events');
    }
};
