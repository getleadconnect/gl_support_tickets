<?php

namespace App\Services;

use App\Jobs\SendTelegramMessageJob;
use Log;

trait TelegramService
{
    /**
     * Send a message to Telegram group
     *
     * @param array $data - Ticket data to send
     * @return void
     */
    public function sendTelegramNotification($data)
    {
        try {
            $botToken = config('services.telegram.bot_token');
            $chatId = config('services.telegram.chat_id');

            if (empty($botToken) || empty($chatId)) {
                \Log::warning("Telegram credentials not configured in .env file");
                return;
            }

            $data['bot_token'] = $botToken;
            $data['chat_id'] = $chatId;

            // Dispatch to background job
            SendTelegramMessageJob::dispatch($data);

        } catch (\Exception $e) {
            \Log::error("Telegram notification error: " . $e->getMessage());
        }
    }

    /**
     * Format ticket message for Telegram
     *
     * @param array $data
     * @return string
     */
    public function formatTelegramMessage($data)
    {
        // Check if this is a status change notification
        if (!empty($data['is_status_change'])) {
            return $this->formatStatusChangeMessage($data);
        }

        $message = "🎫 *NEW TICKET CREATED*\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━━\n\n";

        $message .= "📋 *Tracking Number:* `" . ($data['tracking_number'] ?? 'N/A') . "`\n";
        $message .= "📝 *Issue:* " . ($data['issue'] ?? 'N/A') . "\n";
        $message .= "📄 *Description:* " . ($data['description'] ?? 'N/A') . "\n\n";

        $message .= "👤 *Customer:* " . ($data['customer_name'] ?? 'N/A') . "\n";
        $message .= "📞 *Mobile:* " . ($data['customer_mobile'] ?? 'N/A') . "\n\n";

        $message .= "📅 *Created Date:* " . ($data['created_date'] ?? 'N/A') . "\n";
        $message .= "⏰ *Created Time:* " . ($data['created_time'] ?? 'N/A') . "\n";
        $message .= "✍️ *Created By:* " . ($data['created_by'] ?? 'N/A') . "\n\n";

        $message .= "👥 *Assigned Agents:* " . ($data['assigned_agents'] ?? 'None') . "\n";
        $message .= "🔔 *Notified Agents:* " . ($data['notified_agents'] ?? 'None') . "\n\n";

        $message .= "📍 *Branch:* " . ($data['branch'] ?? 'N/A') . "\n";
        $message .= "⚡ *Priority:* " . ($data['priority'] ?? 'N/A') . "\n";
        $message .= "📊 *Status:* " . ($data['status'] ?? 'N/A') . "\n";

        if (!empty($data['due_date'])) {
            $message .= "📆 *Due Date:* " . $data['due_date'] . "\n";
        }

        $message .= "\n━━━━━━━━━━━━━━━━━━━━━";

        return $message;
    }

    /**
     * Format status change message for Telegram
     *
     * @param array $data
     * @return string
     */
    public function formatStatusChangeMessage($data)
    {
        $message = "🔄 *TICKET STATUS CHANGED*\n";
        $message .= "━━━━━━━━━━━━━━━━━━━━━\n\n";

        $message .= "📊 *Status Changed:* " . ($data['old_status'] ?? 'N/A') . " ➜ " . ($data['new_status'] ?? 'N/A') . "\n";
        $message .= "✍️ *Changed By:* " . ($data['changed_by'] ?? 'N/A') . "\n";
        $message .= "📅 *Changed At:* " . date('d-m-Y h:i A') . "\n\n";

        $message .= "📋 *Tracking Number:* `" . ($data['tracking_number'] ?? 'N/A') . "`\n";
        $message .= "📝 *Issue:* " . ($data['issue'] ?? 'N/A') . "\n\n";

        $message .= "👤 *Customer:* " . ($data['customer_name'] ?? 'N/A') . "\n";
        $message .= "📞 *Mobile:* " . ($data['customer_mobile'] ?? 'N/A') . "\n\n";

        $message .= "👥 *Assigned Agents:* " . ($data['assigned_agents'] ?? 'None') . "\n";
        $message .= "🔔 *Notified Agents:* " . ($data['notified_agents'] ?? 'None') . "\n\n";

        $message .= "📍 *Branch:* " . ($data['branch'] ?? 'N/A') . "\n";
        $message .= "⚡ *Priority:* " . ($data['priority'] ?? 'N/A') . "\n";

        if (!empty($data['due_date'])) {
            $message .= "📆 *Due Date:* " . $data['due_date'] . "\n";
        }

        $message .= "\n━━━━━━━━━━━━━━━━━━━━━";

        return $message;
    }
}
