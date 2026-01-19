<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdditionalFieldOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'option' ,
        'additional_field_id'
    ];

    public function additionalField()
    {
        return $this->belongsTo(AdditionalField::class);
    }
}
