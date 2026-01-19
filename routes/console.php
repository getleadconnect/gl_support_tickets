<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Tasks
|--------------------------------------------------------------------------
|
| Here you may define all of your scheduled tasks. The schedule method
| allows you to define the frequency of execution.
|
*/

// Send daily ticket summary to Telegram at 8:00 PM
Schedule::command('telegram:daily-summary')
    ->dailyAt('20:00')
    ->timezone('Asia/Kolkata')
    ->withoutOverlapping()
    ->onOneServer()
    ->appendOutputTo(storage_path('logs/telegram-daily-summary.log'));
