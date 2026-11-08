<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        @php
            $pagePath = '/'.ltrim(request()->path(), '/');
            $meta = match (true) {
                $pagePath === '/' => ['TOEFL ITP Practice & Test Portal', 'Portal latihan, simulasi, dan ujian TOEFL ITP dengan alur terukur, audio terkontrol, dan laporan hasil yang jelas.', true],
                $pagePath === '/privacy' => ['Kebijakan Privasi - TOEFL ITP', 'Kebijakan pengelolaan data peserta pada platform ujian TOEFL ITP.', true],
                $pagePath === '/terms' => ['Syarat dan Ketentuan - TOEFL ITP', 'Syarat penggunaan layanan dan pelaksanaan ujian TOEFL ITP.', true],
                $pagePath === '/login' => ['Masuk Akun Peserta - TOEFL ITP', 'Masuk ke akun peserta untuk melanjutkan pendaftaran, jadwal, dan hasil ujian TOEFL ITP.', false],
                $pagePath === '/register' => ['Daftar Akun Peserta - TOEFL ITP', 'Buat akun peserta untuk mengikuti layanan ujian TOEFL ITP.', false],
                default => ['TOEFL ITP', 'Platform ujian TOEFL ITP.', false],
            };
            $siteOrigin = rtrim((string) config('app.url'), '/');
            $requestOrigin = rtrim(request()->getSchemeAndHttpHost(), '/');
            $configuredBasePath = rtrim((string) parse_url($siteOrigin, PHP_URL_PATH), '/');
            $requestBasePath = rtrim((string) request()->getBaseUrl(), '/');
            if ($siteOrigin === '' || parse_url($siteOrigin, PHP_URL_HOST) === null) {
                $siteOrigin = $requestOrigin;
                $configuredBasePath = '';
            }
            $appBasePath = $configuredBasePath !== '' ? $configuredBasePath : $requestBasePath;
            if ($configuredBasePath === '' && $requestBasePath !== '') {
                $siteOrigin .= $requestBasePath;
            }
            $siteOrigin = rtrim($siteOrigin, '/');
            $canonicalUrl = $siteOrigin.($pagePath === '/' ? '/' : $pagePath);
            $ogImageUrl = $siteOrigin.'/og-image.png';
        @endphp
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="app-base-path" content="{{ $appBasePath }}">
        <title>{{ $meta[0] }}</title>
        <meta name="description" content="{{ $meta[1] }}">
        <meta name="robots" content="{{ $meta[2] ? 'index, follow' : 'noindex, nofollow' }}">
        <link rel="canonical" href="{{ $canonicalUrl }}">
        <meta name="theme-color" content="#0b2a4a">
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ $canonicalUrl }}">
        <meta property="og:title" content="{{ $meta[0] }}">
        <meta property="og:description" content="{{ $meta[1] }}">
        <meta property="og:image" content="{{ $ogImageUrl }}">
        <meta property="og:image:url" content="{{ $ogImageUrl }}">
        <meta property="og:image:type" content="image/png">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="Identitas platform TOEFL ITP">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $meta[0] }}">
        <meta name="twitter:description" content="{{ $meta[1] }}">
        <meta name="twitter:image" content="{{ $ogImageUrl }}">
        <link rel="icon" href="{{ $appBasePath }}/favicon.svg" type="image/svg+xml" data-default-favicon>
        <link rel="apple-touch-icon" href="{{ $appBasePath }}/apple-touch-icon.png">

        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
