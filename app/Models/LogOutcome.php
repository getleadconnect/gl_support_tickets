<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogOutcome extends Model
{
    use HasFactory;
    protected $fillable = ['id','outcome','type_id'];
}
