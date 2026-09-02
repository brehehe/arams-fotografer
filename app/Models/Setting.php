<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
        'description',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        try {
            return Cache::rememberForever("setting.{$key}", function () use ($key, $default) {
                $setting = static::where('key', $key)->first();
                if (! $setting) {
                    return $default;
                }

                return match ($setting->type) {
                    'boolean' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
                    'number' => is_numeric($setting->value) ? $setting->value + 0 : $default,
                    'json' => json_decode($setting->value, true) ?? $default,
                    default => $setting->value,
                };
            });
        } catch (\Throwable $e) {
            return $default;
        }
    }

    public static function set(string $key, mixed $value, string $group = 'general', string $type = 'string'): static
    {
        $stringValue = is_array($value) ? json_encode($value) : (string) $value;
        $setting = static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $stringValue,
                'group' => $group,
                'type' => $type,
            ]
        );

        Cache::forget("setting.{$key}");

        return $setting;
    }
}
