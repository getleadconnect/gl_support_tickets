<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'category_id',
        'branch_id',
        'brand_id',
        'status',
        'stock',
        'initial_stock',
        'cost',
        'created_by'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class,'category_id');
    }
    
    public function brand()
    {
        return $this->belongsTo(Brand::class,'brand_id');
    }
    
    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function reduceStock($quantity)
    {
        $this->stock -= $quantity;
        $this->save();
    }

    public function increaseStock($quantity)
    {
        $this->stock += $quantity;
        $this->save();
    }
}
