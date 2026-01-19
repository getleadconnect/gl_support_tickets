<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchedulePickup extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_id',
        'branch_id',
        'address',
        'landmark',
        'schedule_date',
        'time_slot',
        'contact_person',
        'mobile',
        'status'
    ];

    /**
     * Get the ticket that owns the schedule pickup
     */
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    /**
     * Get the branch that owns the schedule pickup
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the customer through the ticket
     */
    public function customer()
    {
        return $this->hasOneThrough(
            Customer::class,
            Ticket::class,
            'id', // Foreign key on tickets table
            'id', // Foreign key on customers table
            'ticket_id', // Local key on schedule_pickups table
            'customer_id' // Local key on tickets table
        );
    }
}
