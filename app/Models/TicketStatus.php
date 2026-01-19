<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketStatus extends Model
{
    use HasFactory;

    protected $table = 'ticket_statuses';

    protected $fillable = ['status', 'color_code', 'active', 'stage_id', 'created_by', 'order'];
    
    protected $appends = ['name', 'color'];

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'status');
    }
    
    // Accessor to map 'status' to 'name' for frontend compatibility
    public function getNameAttribute()
    {
        return $this->status;
    }
    
    // Accessor to map 'color_code' to 'color' for frontend compatibility
    public function getColorAttribute()
    {
        return $this->color_code;
    }
}