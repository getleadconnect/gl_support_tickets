<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class AgentTicket extends Model
{
    use HasFactory ;
    
	protected $guarded=[];
	
	protected $table="agent_ticket";
	
	protected $fillable = ['ticket_id','agent_id'];

}
