<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketImage extends Model
{
    use HasFactory;

	protected $guarded=[];

    public function images()
    {
        return $this->belongsTo(Ticket::class);
    }
}
