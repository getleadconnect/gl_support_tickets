<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Customer extends Model
{
    use HasFactory;
    use Notifiable;

    protected $guarded = [];
    protected $table="customers";
    
    protected $fillable = [
        'name',
        'email',
        'country_code',
        'mobile',
        'company_name',
        'branch_id',
        'created_by',
    ];

  
    protected $hidden = [
        'created_at',
        'updated_at',
    ];


    public function ticket()
    {
        return $this->hasMany(Ticket::class);
    }
    
    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }
}
