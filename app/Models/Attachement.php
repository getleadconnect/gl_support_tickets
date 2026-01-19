<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attachement extends Model
{
    use HasFactory;
    const TYPE_FILE_NOTE = 1;
    const TYPE_DOCUMENT = 2;
    const TYPE_VOICE_NOTE = 3;
    const TYPE_VIDEO_NOTE = 4;
}
