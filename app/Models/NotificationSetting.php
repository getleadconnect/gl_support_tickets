<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_type',
        'whatsapp_api',
        'token',
        'secret_key',
        'template_name',
        'template_text',
        'status',
        'created_by'
    ];

    protected $casts = [
        'status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'secret_key',
        'token'
    ];

    protected $appends = ['masked_token', 'masked_secret_key'];

    public function getMaskedTokenAttribute()
    {
        if (!$this->token) return null;
        $length = strlen($this->token);
        if ($length <= 8) return str_repeat('*', $length);
        return substr($this->token, 0, 4) . str_repeat('*', $length - 8) . substr($this->token, -4);
    }

    public function getMaskedSecretKeyAttribute()
    {
        if (!$this->secret_key) return null;
        $length = strlen($this->secret_key);
        if ($length <= 8) return str_repeat('*', $length);
        return substr($this->secret_key, 0, 4) . str_repeat('*', $length - 8) . substr($this->secret_key, -4);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('message_type', $type);
    }
}