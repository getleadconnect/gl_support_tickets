<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmsSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_name',
        'sms_api',
        'api_token',
        'sender_id',
        'status',
        'created_by'
    ];

    protected $casts = [
        'status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];


    protected $appends = ['masked_token'];

    public function getMaskedTokenAttribute()
    {
        if (!$this->api_token) return null;
        $length = strlen($this->api_token);
        if ($length <= 5) return str_repeat('*', $length);
        return substr($this->api_token, 0, 4) . str_repeat('*', $length) . substr($this->api_token, -4)."....";
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
