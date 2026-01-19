<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class TaskCategory extends Model
{
    use HasFactory;

    public function tasks()
    {
        return $this->hasMany(Task::class, 'category_id', 'id');
    }
}
