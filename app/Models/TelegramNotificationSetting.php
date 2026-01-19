<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TelegramNotificationSetting extends Model
{
    protected $fillable = [
        'event_type',
        'event_name',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    /**
     * Check if a specific notification event is enabled
     *
     * @param string $eventType
     * @return bool
     */
    public static function isEnabled(string $eventType): bool
    {
        $setting = self::where('event_type', $eventType)->first();
        return $setting ? $setting->is_active : false;
    }
}
