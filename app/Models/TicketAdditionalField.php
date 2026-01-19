<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketAdditionalField extends Model
{
    use HasFactory;


	protected $guarded=[];

    protected $casts = [
        'selected_option_ids' => 'array'
    ];

    public function additionalField()
    {
        return $this->belongsTo(AdditionalField::class,'additional_field_id');
    }
}
