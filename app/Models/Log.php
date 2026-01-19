<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;
    protected $fillable = ['id','agent_id','ticket_id','outcome_id','type_id','time','description'];

    public function agent()
    {
        return $this->belongsTo(User::class,'agent_id');
    }
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
    public function type()
    {
        return $this->belongsTo(LogType::class);
    }
    public function outcome()
    {
        return $this->belongsTo(LogOutcome::class);
    }
    public function file()
    {
        return $this->hasMany(FileLog::class);
    }
}
