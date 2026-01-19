<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Auth;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    const ACTIVATE = 1;

    const DEACTIVATE = 0;

    const ADMIN = 1;

    const AGENTS = 2;

    const MANAGER = 3;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'department_id',
        'designation_id',
        'country_code',
        'mobile',
        'status',
        'branch_id',
        'parent_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'role_id' => 'integer',
            'department_id' => 'integer',
            'designation_id' => 'integer',
            'branch_id' => 'integer',
            'status' => 'integer',
        ];
    }

    public function isAdmin()
    {
        if (Auth::user()->role_id == self::ADMIN) {
            return true;
        }
    }

    public function isAgent()
    {
        if (Auth::user()->role_id == self::AGENT) {
            return true;
        }
    }

    public function isManager()
    {
        if (Auth::user()->role_id == self::MANAGER) {
            return true;
        }
    }

    public static function getVendorId()
    {
        if (auth()->check()) {
            if (Auth::user()->role_id == self::ADMIN) {
                $vendorId = Auth::user()->id;
            } else {
                $vendorId = Auth::user()->id;
            }

            return $vendorId;
        } else {
            return null;
        }
    }

    public function ticket()
    {
        return $this->belongsToMany(Ticket::class, 'agent_ticket', 'agent_id', 'ticket_id');
    }

    public function task()
    {
        return $this->belongsToMany(Task::class, 'agent_task', 'task_id', 'agent_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class)->select('id', 'department_name');
    }

    public function designation()
    {
        return $this->belongsTo(Designation::class)->select('id', 'designation_name');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class)->select('id', 'branch_name');
    }

    public function assignedAgents()
    {
        return $this->hasMany(\App\Models\AssignAgent::class, 'user_id');
    }
}
