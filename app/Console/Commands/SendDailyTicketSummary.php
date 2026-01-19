<?php

namespace App\Console\Commands;

use App\Jobs\SendDailyTelegramSummaryJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendDailyTicketSummary extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'telegram:daily-summary';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily ticket summary to Telegram at 8:00 PM';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $botToken = config('services.telegram.bot_token');
            $chatId = config('services.telegram.chat_id');

            if (empty($botToken) || empty($chatId)) {
                $this->error('Telegram credentials not configured in .env file');
                Log::warning('Daily Telegram summary: Credentials not configured');
                return 1;
            }

            // Dispatch the job to send the summary
            SendDailyTelegramSummaryJob::dispatch();

            $this->info('Daily ticket summary job dispatched successfully!');
            Log::info('Daily Telegram summary job dispatched');

            return 0;

        } catch (\Exception $e) {
            $this->error('Failed to dispatch daily summary: ' . $e->getMessage());
            Log::error('Daily Telegram summary error: ' . $e->getMessage());
            return 1;
        }
    }
}
