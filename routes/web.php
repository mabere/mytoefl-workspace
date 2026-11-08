<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Home'))->name('home');
Route::get('/login', fn () => Inertia::render('Login'))->name('login');
Route::get('/register', fn () => Inertia::render('Register'))->name('register');
Route::get('/privacy', fn () => Inertia::render('Privacy'))->name('privacy');
Route::get('/terms', fn () => Inertia::render('Terms'))->name('terms');
Route::get('/thank-you', fn () => Inertia::render('ThankYou'))->name('thank-you');
Route::get('/student/dashboard', fn () => Inertia::render('Student/Dashboard'))->name('student.dashboard');
Route::get('/exam/{sessionId}', fn () => Inertia::render('Exam'))->name('exam');
Route::get('/result/{sessionId}', fn () => Inertia::render('Result'))->name('result');
Route::get('/demo/{demoId}', fn () => Inertia::render('Demo'))->name('demo');
Route::get('/demo/result/{demoId}', fn () => Inertia::render('DemoResult'))->name('demo.result');
Route::get('/certificate/{verificationCode}', fn () => Inertia::render('Certificate'))->name('certificate');
Route::get('/verify/{verificationCode}', fn () => Inertia::render('Verify'))->name('verify');
Route::get('/admin/login', fn () => Inertia::render('Admin/Login'))->name('admin.login');
Route::get('/admin', fn () => Inertia::render('Admin/Dashboard'))->name('admin.dashboard');
Route::get('/admin/packages/{packageId}', fn (string $packageId) => Inertia::render('Admin/Package', ['packageId' => $packageId]))->name('admin.package');

Route::get('/sitemap.xml', function (Request $request) {
    $urls = ['/', '/privacy', '/terms'];
    $baseUrl = rtrim((string) config('app.url'), '/');
    $requestBasePath = rtrim((string) $request->getBaseUrl(), '/');
    if ($baseUrl === '' || parse_url($baseUrl, PHP_URL_HOST) === null) {
        $baseUrl = rtrim($request->getSchemeAndHttpHost().$request->getBaseUrl(), '/');
    } elseif (parse_url($baseUrl, PHP_URL_PATH) === null && $requestBasePath !== '') {
        $baseUrl .= $requestBasePath;
    }
    $xml = '<?xml version="1.0" encoding="UTF-8"?>';
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    foreach ($urls as $path) {
        $xml .= '<url><loc>'.htmlspecialchars($baseUrl.$path, ENT_XML1, 'UTF-8').'</loc><changefreq>'.($path === '/' ? 'weekly' : 'yearly').'</changefreq></url>';
    }
    $xml .= '</urlset>';

    return response($xml, 200)->header('Content-Type', 'application/xml; charset=UTF-8');
})->name('sitemap');

Route::get('/robots.txt', function (Request $request) {
    $baseUrl = rtrim((string) config('app.url'), '/');
    $requestBasePath = rtrim((string) $request->getBaseUrl(), '/');
    if ($baseUrl === '' || parse_url($baseUrl, PHP_URL_HOST) === null) {
        $baseUrl = rtrim($request->getSchemeAndHttpHost().$request->getBaseUrl(), '/');
    } elseif (parse_url($baseUrl, PHP_URL_PATH) === null && $requestBasePath !== '') {
        $baseUrl .= $requestBasePath;
    }

    $robots = implode("\n", [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /api/',
        'Disallow: /exam/',
        'Disallow: /student/',
        'Disallow: /result/',
        'Disallow: /demo/',
        'Disallow: /certificate/',
        'Disallow: /verify/',
        'Sitemap: '.$baseUrl.'/sitemap.xml',
        '',
    ]);

    return response($robots, 200)->header('Content-Type', 'text/plain; charset=UTF-8');
})->name('robots');
