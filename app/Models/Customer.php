<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = ['name', 'company', 'email', 'plan', 'status', 'industry', 'phone', 'notes'];

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }
}
