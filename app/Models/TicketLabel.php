<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketLabel extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'label_name',
        'color',
        'active',
        'created_by',
    ];
    
    protected $casts = [
        'active' => 'boolean',
    ];
    
    public function tickets()
    {
        return $this->belongsToMany(Ticket::class, 'label_ticket', 'label_id', 'ticket_id');
    }
    
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
