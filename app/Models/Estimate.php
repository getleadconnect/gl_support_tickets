<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estimate extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'customer_name',
        'address',
        'phone_number',
        'estimate_number',
        'estimate_date',
        'valid_upto',
        'description',
        'total_amount',
        'gst',
        'cgst',
        'sgst',
        'status',
        'created_by'
    ];

    protected $casts = [
        'estimate_date' => 'date',
        'valid_upto' => 'date',
        'total_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function items()
    {
        return $this->hasMany(EstimateItem::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    // Generate unique estimate number
    public static function generateEstimateNumber()
    {
        $lastEstimate = static::orderBy('id', 'desc')->first();
        $nextNumber = $lastEstimate ? $lastEstimate->id + 1 : 1;
        return 'EST' . str_pad($nextNumber, 7, '0', STR_PAD_LEFT);
    }
}
