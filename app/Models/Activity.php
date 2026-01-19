<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'note',
        'title',
        'status_id',
        'branch_id',
        'priority_id',
        'agent_id',
        'ticket_id',
        'log_id',
        'created_by',
        'description',
        'task_id',
        'schedule_date',
        'log_file',
        'log_file_type'
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
    public function log()
    {
        return $this->belongsTo(Log::class);
    }
    public function task()
    {
        return $this->belongsTo(Task::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class,'created_by');
    }
    public function status()
    {
        return $this->belongsTo(TicketStatus::class,'status_id');
    }
    public function priority()
    {
        return $this->belongsTo(Priority::class,'priority_id');
    }
}
