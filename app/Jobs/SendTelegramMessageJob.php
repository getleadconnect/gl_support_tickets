<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Services\TelegramService;

class SendTelegramMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, TelegramService;

    protected $data;

    /**
     * Create a new job instance.
     */
    public function __construct(array $data)
    {
        $this->data = $data;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $botToken = $this->data['bot_token'];
            $chatId = $this->data['chat_id'];

            // Format the message
            $message = $this->formatTelegramMessage($this->data);

            // Telegram API endpoint
            $url = "https://api.telegram.org/bot{$botToken}/sendMessage";

            // Send the message via Telegram API
            $response = Http::post($url, [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'Markdown',
                'disable_web_page_preview' => true
            ]);

            if ($response->successful()) {
                Log::info("Telegram notification sent successfully for ticket: " . ($this->data['tracking_number'] ?? 'Unknown'));
            } else {
                Log::error("Telegram API error: " . $response->body());
            }

        } catch (\Exception $e) {
            Log::error("SendTelegramMessageJob failed: " . $e->getMessage());
        }
    }
}
