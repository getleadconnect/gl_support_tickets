<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyLogo extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'logo_image',
        'type',
        'is_active',
        'created_by'
    ];
    
    protected $casts = [
        'is_active' => 'boolean'
    ];

    /**
     * Boot the model and add event listeners
     */
    protected static function boot()
    {
        parent::boot();

        // When creating a new logo
        static::creating(function ($logo) {
            if ($logo->is_active) {
                // Deactivate all other active logos of the SAME TYPE
                static::where('is_active', true)
                    ->where('type', $logo->type)
                    ->update(['is_active' => false]);
            }
        });

        // When updating an existing logo
        static::updating(function ($logo) {
            if ($logo->is_active && $logo->isDirty('is_active')) {
                // Deactivate all other active logos of the SAME TYPE except this one
                static::where('is_active', true)
                    ->where('type', $logo->type)
                    ->where('id', '!=', $logo->id)
                    ->update(['is_active' => false]);
            }
        });
    }
    
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    /**
     * Get the currently active logo (type = Logo)
     */
    public static function getActiveLogo()
    {
        return static::where('is_active', true)->where('type', 'Logo')->first();
    }
    
    /**
     * Get the currently active favicon (type = Favicon)
     */
    public static function getActiveFavicon()
    {
        return static::where('is_active', true)->where('type', 'Favicon')->first();
    }
    
    /**
     * Scope to get only active logos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    
    /**
     * Scope to get only active logos by type
     */
    public function scopeActiveByType($query, $type)
    {
        return $query->where('is_active', true)->where('type', $type);
    }
}
