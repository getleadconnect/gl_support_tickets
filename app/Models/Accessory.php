<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Accessory extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'created_by'
    ];
    
    /**
     * Get the user who created this accessory
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}