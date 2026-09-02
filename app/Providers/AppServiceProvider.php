<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Expression;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        // Register a global booted event listener for all Eloquent models to apply a default ASC ordering
        Event::listen('eloquent.booted: *', function ($eventName, array $data) {
            $model = $data[0];
            $modelClass = get_class($model);

            if (str_starts_with($modelClass, 'App\\')) {
                $modelClass::addGlobalScope('default_order', function (Builder $builder) {
                    $query = $builder->getQuery();
                    if (empty($query->orders) && empty($query->groups) && empty($query->aggregate) && empty($query->distinct) && empty($query->unions)) {
                        // Check if any custom selected columns contain aggregate functions
                        $hasAggregate = false;
                        if (! empty($query->columns)) {
                            foreach ($query->columns as $column) {
                                $colStr = $column instanceof Expression
                                    ? $column->getValue(DB::connection()->getQueryGrammar())
                                    : (string) $column;

                                if (preg_match('/\b(count|sum|avg|min|max|stddev|variance|string_agg|array_agg|json_agg|jsonb_agg)\s*\(/i', $colStr)) {
                                    $hasAggregate = true;
                                    break;
                                }
                            }
                        }

                        if (! $hasAggregate) {
                            $model = $builder->getModel();
                            if ($model->getKeyName()) {
                                $builder->orderBy($model->getTable().'.'.$model->getKeyName(), 'asc');
                            }
                        }
                    }
                });
            }
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
