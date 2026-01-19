<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class AgentTask extends Model
{
    use HasFactory ;
    
	protected $guarded=[];
	
	protected $table="agent_task";
	

}
