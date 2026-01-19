<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ticket extends Model
{
    use HasFactory , SoftDeletes;

    protected $guarded = [];

    protected $fillable = ['id', 'issue', 'description', 'customer_id', 'priority', 'status', 'due_date', 'ticket_type', 'branch_id', 'tracking_number', 'due_date', 'created_by', 'slug', 'service_id', 'service_type', 'closed_time', 'closed_at', 'branch', 'label', 'verified_at', 'remarks', 'accessories'];

    protected $table = 'tickets';

    protected $casts = [ 
        'notify_to' => 'array',
        'accessories' => 'array'
    ];

    public function agent()
    {
        return $this->belongsToMany(User::class, 'agent_ticket', 'ticket_id', 'agent_id');
    }

    public function getUserTokensAttribute()
    {
        return $this->agent->pluck('fcm_token')->toArray();
    }

    public function notifyTo()
    {
        return $this->belongsToMany(User::class, 'notify_ticket', 'ticket_id', 'agent_id')->select('users.id', 'users.name', 'users.country_code', 'users.mobile', 'users.email');
    }

    public function ticketLabel()
    {
        return $this->belongsToMany(TicketLabel::class, 'label_ticket', 'ticket_id', 'label_id')->select('ticket_labels.id', 'ticket_labels.label_name', 'ticket_labels.color');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function type()
    {
        return $this->belongsTo(TicketType::class, 'ticket_type');
    }

    public function ticketStatus()
    {
        return $this->belongsTo(TicketStatus::class, 'status');
    }

    public function ticketPriority()
    {
        return $this->belongsTo(Priority::class, 'priority');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function images()
    {
        return $this->hasMany(TicketImage::class);
    }

    public function activity()
    {
        return $this->hasMany(Activity::class)->orderBy('created_at', 'DESC');
    }

    public function additional()
    {
        return $this->belongsToMany(AdditionalField::class, 'ticket_additional_fields', 'ticket_id', 'additional_field_id');
    }

    public function ticketAdditionalField()
    {
        return $this->hasMany(TicketAdditionalField::class, 'ticket_id');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_tickets', 'ticket_id', 'product_id')
            ->withPivot('quantity', 'price', 'total_price')->withTimestamps();
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class, 'ticket_id');
    }
}
