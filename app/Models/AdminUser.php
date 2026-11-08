<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $username
 * @property string|null $email
 * @property string $password
 * @property string $name
 * @property string|null $photo_url
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class AdminUser extends Authenticatable
{
    use HasUuids, Notifiable;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'admin_users';

    protected $fillable = ['username', 'email', 'password', 'name', 'photo_url'];

    protected $hidden = ['password', 'remember_token'];
}
