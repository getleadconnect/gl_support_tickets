<?php

namespace App\Models;

use App\Enums\TaskStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'time' => 'datetime',
        //'status' => TaskStatusEnum::class
    ];

    public function agent()
    {
        return $this->belongsToMany(User::class, 'agent_task', 'task_id', 'agent_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class)->withTrashed();
    }

    public function type()
    {
        return $this->belongsTo(TaskType::class);
    }

    public function category()
    {
        return $this->belongsTo(TaskCategory::class, 'category_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function taskStatus()
    {
        return $this->belongsTo(TaskStatus::class, 'status', 'id');
    }
}
