<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Priority extends Model
{
    use HasFactory;

    protected $table = 'priorities';

    protected $fillable = ['title', 'color', 'active'];
    
    protected $appends = ['name'];

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'priority');
    }
    
    // Accessor to map 'title' to 'name' for frontend compatibility
    public function getNameAttribute()
    {
        return $this->title;
    }
}