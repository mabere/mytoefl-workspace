<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamToken extends ToeflModel
{
    protected $fillable = ['token_code', 'label', 'package_id', 'is_used'];

    protected $casts = ['is_used' => 'boolean'];

    /** @return BelongsTo<ExamPackage, $this> */
    public function package(): BelongsTo
    {
        return $this->belongsTo(ExamPackage::class, 'package_id');
    }
}
