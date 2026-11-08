<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class AdminUser extends Authenticatable
{
    use HasUuids, Notifiable;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'admin_users';

    protected $fillable = ['username', 'password', 'name'];

    protected $hidden = ['password', 'remember_token'];
}
