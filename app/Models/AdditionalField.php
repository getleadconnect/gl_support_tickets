<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdditionalField extends Model
{
    use HasFactory;

	protected $guarded=[];

    protected $casts = [
        'value' => 'array'
    ];

    public function additionalFieldOptions():HasMany
    {
        return $this->hasMany(AdditionalFieldOption::class);
    }

    public function tickets()
    {
        return $this->belongsToMany(Ticket::class, 'ticket_additional_fields', 'additional_field_id', 'ticket_id');
    }

}
