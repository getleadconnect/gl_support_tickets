<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'ticket_id',
        'customer_id',
        'branch_id',
        'description',
        'service_charge',
        'item_amount',
        'total_amount',
        'discount',
        'gst_amount',
        'net_amount',
        'paid_amount',
        'balance_due',
        'payment_mode',
        'created_by',
    ];

    protected $casts = [
        'service_charge' => 'decimal:2',
        'item_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'gst_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }
}
