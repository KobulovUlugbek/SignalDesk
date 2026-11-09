<?php

use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AutomationController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\InsightsController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TicketController;
use Illuminate\Support\Facades\Route;

Route::middleware('web')->group(function (): void {
    Route::get('/auth/session', [AuthController::class, 'session']);
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware(['auth', 'throttle:120,1'])->group(function (): void {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::get('/dashboard', [InsightsController::class, 'dashboard']);
        Route::get('/analytics', [InsightsController::class, 'analytics']);
        Route::get('/activity', [InsightsController::class, 'activity']);
        Route::get('/search', [InsightsController::class, 'search']);
        Route::get('/team', [InsightsController::class, 'team']);
        Route::get('/export/tickets', [InsightsController::class, 'export']);
        Route::get('/tickets', [TicketController::class, 'index']);
        Route::get('/tickets/{ticket}', [TicketController::class, 'show']);
        Route::get('/customers', [CustomerController::class, 'index']);
        Route::get('/tasks', [TaskController::class, 'index']);
        Route::get('/articles', [ArticleController::class, 'index']);
        Route::get('/automations', [AutomationController::class, 'index']);

        Route::middleware('can:write')->group(function (): void {
            Route::post('/tickets', [TicketController::class, 'store']);
            Route::patch('/tickets/{ticket}', [TicketController::class, 'update']);
            Route::post('/tickets/{ticket}/notes', [TicketController::class, 'note']);
            Route::post('/customers', [CustomerController::class, 'store']);
            Route::patch('/customers/{customer}', [CustomerController::class, 'update']);
            Route::post('/tasks', [TaskController::class, 'store']);
            Route::patch('/tasks/{task}', [TaskController::class, 'update']);
            Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
            Route::post('/articles', [ArticleController::class, 'store']);
            Route::patch('/articles/{article}', [ArticleController::class, 'update']);
            Route::delete('/articles/{article}', [ArticleController::class, 'destroy']);
        });
        Route::middleware('can:admin')->group(function (): void {
            Route::post('/automations', [AutomationController::class, 'store']);
            Route::patch('/automations/{automation}', [AutomationController::class, 'update']);
            Route::delete('/automations/{automation}', [AutomationController::class, 'destroy']);
        });
    });
});
