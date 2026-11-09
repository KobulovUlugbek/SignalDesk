<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('signaldesk:about', function (): void {
    $this->info('SignalDesk — Laravel API + React dashboard');
})->purpose('Display demo application information');
