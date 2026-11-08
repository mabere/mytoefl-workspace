import { createInertiaApp, Head, usePage } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { appPath, appUrl, getBasePath } from './lib/api';
import { absoluteSiteUrl, pageMetadata } from './lib/pageMetadata';

function PageMetadata() {
    const page = usePage();
    const basePath = getBasePath();
    const rawPathname = (page.url || window.location.pathname).split('?')[0];
    const pathname = basePath && rawPathname.startsWith(basePath)
        ? rawPathname.slice(basePath.length) || '/'
        : rawPathname;
    const metadata = pageMetadata(pathname);
    const canonicalUrl = absoluteSiteUrl(pathname, page.props);
    const ogImage = absoluteSiteUrl('/og-image.png', page.props);

    return (
        <Head title={metadata.title}>
            <meta name="description" content={metadata.description} />
            <meta name="robots" content={metadata.indexable ? 'index, follow' : 'noindex, nofollow'} />
            <link rel="canonical" href={canonicalUrl} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={metadata.title} />
            <meta property="og:description" content={metadata.description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:url" content={ogImage} />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content="Identitas platform TOEFL ITP" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metadata.title} />
            <meta name="twitter:description" content={metadata.description} />
            <meta name="twitter:image" content={ogImage} />
        </Head>
    );
}

function ConsentBanner() {
    const analyticsEnabled = String(import.meta.env.VITE_ANALYTICS_ENABLED || '').toLowerCase() === 'true';
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!analyticsEnabled) return;
        setVisible(localStorage.getItem('toefl_analytics_consent') === null);
    }, [analyticsEnabled]);

    if (!analyticsEnabled || !visible) return null;

    const decide = (value) => {
        localStorage.setItem('toefl_analytics_consent', value);
        window.dispatchEvent(new CustomEvent('toefl-analytics-consent', { detail: { consent: value === 'granted' } }));
        setVisible(false);
    };

    return (
        <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-slate-200 bg-white p-4 shadow-2xl sm:p-5" role="dialog" aria-label="Preferensi cookie">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-xs leading-5 text-slate-600">Kami menggunakan pengukuran anonim untuk memahami performa halaman publik. Cookie wajib tetap aktif agar login dan ujian dapat berjalan. Baca <a href={appPath('/privacy')} className="font-bold text-blue-700 underline">Kebijakan Privasi</a>.</p>
                <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => decide('denied')} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Tolak</button>
                    <button type="button" onClick={() => decide('granted')} className="rounded-lg bg-[#0b2a4a] px-3 py-2 text-xs font-bold text-white">Izinkan analitik</button>
                </div>
            </div>
        </div>
    );
}

function InstitutionBranding() {
    useEffect(() => {
        const applyFavicon = (logoUrl) => {
            if (!logoUrl) return;

            const favicon = document.querySelector('link[data-default-favicon], link[data-institution-favicon]')
                || document.createElement('link');
            favicon.rel = 'icon';
            favicon.setAttribute('data-institution-favicon', 'true');
            favicon.href = appUrl(logoUrl);
            document.head.appendChild(favicon);
        };

        const handleLogoUpdate = (event) => {
            applyFavicon(event.detail?.url);
        };

        window.addEventListener('institution-logo-updated', handleLogoUpdate);
        fetch(appUrl('/api/branding'), { headers: { Accept: 'application/json' }, credentials: 'same-origin' })
            .then((response) => (response.ok ? response.json() : null))
            .then((branding) => applyFavicon(branding?.logoUrl))
            .catch(() => undefined);

        return () => window.removeEventListener('institution-logo-updated', handleLogoUpdate);
    }, []);

    return null;
}

createInertiaApp({
    title: (title) => (title ? `${title} - TOEFL ITP` : 'TOEFL ITP'),
    resolve: async (name) => {
        const pages = import.meta.glob('./Pages/**/*.{jsx,tsx}');
        const loader = pages[`./Pages/${name}.jsx`] || pages[`./Pages/${name}.tsx`];
        if (!loader) throw new Error(`Inertia page not found: ${name}`);
        const module = await loader();
        return module.default;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <App
                {...props}
                children={({ Component, props: pageProps, key }) => (
                    <>
                        <PageMetadata />
                        <InstitutionBranding />
                        <ConsentBanner />
                        <Component {...pageProps} key={key} />
                    </>
                )}
            />
        );
    },
});
