<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Symfony\Component\HttpFoundation\Response;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    public function handle(Request $request, Closure $next): Response
    {
        $response = parent::handle($request, $next);
        $path = '/'.ltrim($request->path(), '/');
        if ($path === '/login' || $path === '/register' || $path === '/thank-you' || str_starts_with($path, '/admin') || str_starts_with($path, '/student') || str_starts_with($path, '/exam/') || str_starts_with($path, '/result/') || str_starts_with($path, '/demo/') || str_starts_with($path, '/certificate/') || str_starts_with($path, '/verify/')) {
            $response->headers->set('X-Robots-Tag', 'noindex, nofollow, noarchive');
        }

        return $response;
    }

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'site' => [
                'origin' => rtrim((string) config('app.url'), '/'),
                'name' => (string) config('app.name'),
            ],
        ];
    }
}
