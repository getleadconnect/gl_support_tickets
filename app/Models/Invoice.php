<?php

namespace App\Models;

use App\Enums\InvoiceStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;
	
	protected $guarded=[];

    protected $fillable = [
        'invoice_id',
        'ticket_id',
        'customer_id',
        'branch_id',
        'item_cost',
        'service_charge',
        'service_type',
        'invoice_type',
        'description',
        'total_amount',
        'discount',
        'gst_rate',
        'taxable_amount',
        'gst_amount',
        'cgst_amount',
        'sgst_amount',
        'net_amount',
        'paid_amount',
        'balance_due',
        'payment_method',
        'status',
        'invoice_date',
        'created_by',
    ];

    protected $casts = [
        'item_cost' => 'decimal:2',
        'service_charge' => 'decimal:2',
        'discount' => 'decimal:2',
        'gst_amount' => 'decimal:2',
        'cgst_amount' => 'decimal:2',
        'sgst_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'balance_due' => 'decimal:2',
        'invoice_date' => 'datetime',
    ];
    
    public function ticket()
    {
        return $this->belongsTo(Ticket::class,'ticket_id');
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
    
    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

}



