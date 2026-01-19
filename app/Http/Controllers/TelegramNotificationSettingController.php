<?php

namespace App\Http\Controllers;

use App\Models\TelegramNotificationSetting;
use Illuminate\Http\Request;

class TelegramNotificationSettingController extends Controller
{
    /**
     * Get all telegram notification settings
     */
    public function index()
    {
        $settings = TelegramNotificationSetting::all();

        // If no settings exist, create default ones
        if ($settings->isEmpty()) {
            $this->createDefaultSettings();
            $settings = TelegramNotificationSetting::all();
        }

        return response()->json($settings);
    }

    /**
     * Check if Telegram credentials are configured
     */
    public function checkCredentials()
    {
        $botToken = config('services.telegram.bot_token');
        $chatId = config('services.telegram.chat_id');

        $isConfigured = !empty($botToken) && !empty($chatId);

        return response()->json([
            'is_configured' => $isConfigured,
            'bot_token_exists' => !empty($botToken),
            'chat_id_exists' => !empty($chatId)
        ]);
    }

    /**
     * Toggle the status of a notification setting
     */
    public function toggleStatus(Request $request, $id)
    {
        // Check if credentials are configured before enabling
        $botToken = config('services.telegram.bot_token');
        $chatId = config('services.telegram.chat_id');

        $setting = TelegramNotificationSetting::findOrFail($id);

        // If trying to enable and credentials are not configured, return error
        if (!$setting->is_active && (empty($botToken) || empty($chatId))) {
            return response()->json([
                'message' => 'TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID not added. Please add these values in .env file.',
                'credentials_missing' => true
            ], 400);
        }

        $setting->is_active = !$setting->is_active;
        $setting->save();

        return response()->json([
            'message' => 'Notification setting updated successfully',
            'setting' => $setting
        ]);
    }

    /**
     * Update a specific setting
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean'
        ]);

        $setting = TelegramNotificationSetting::findOrFail($id);
        $setting->update($validated);

        return response()->json([
            'message' => 'Notification setting updated successfully',
            'setting' => $setting
        ]);
    }

    /**
     * Create default notification settings
     */
    private function createDefaultSettings()
    {
        $defaults = [
            [
                'event_type' => 'new_ticket',
                'event_name' => 'New Ticket Created',
                'description' => 'Send Telegram notification when a new ticket is created',
                'is_active' => true
            ],
            [
                'event_type' => 'ticket_status_change',
                'event_name' => 'Ticket Status Change',
                'description' => 'Send Telegram notification when ticket status is changed',
                'is_active' => true
            ]
        ];

        foreach ($defaults as $default) {
            TelegramNotificationSetting::create($default);
        }
    }
}
