function getBasePath() {
    if (typeof document === 'undefined') return '';

    const configured = document.querySelector('meta[name="app-base-path"]')?.getAttribute('content') || '';

    return configured === '/' ? '' : configured.replace(/\/+$/, '');
}

export function appPath(path = '') {
    if (typeof path !== 'string' || /^(https?:)?\/\//i.test(path)) {
        return path;
    }

    if (path.startsWith('#') || path.startsWith('?')) {
        return path;
    }

    const basePath = getBasePath();
    const normalizedPath = path === '' ? '/' : `/${path.replace(/^\/+/, '')}`;

    if (!basePath || normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`)) {
        return normalizedPath;
    }

    return `${basePath}${normalizedPath === '/' ? '/' : normalizedPath}`;
}

export async function apiFetch(input, options = {}) {
    const meta = document.querySelector('meta[name="csrf-token"]');
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');
    headers.set('X-Requested-With', 'XMLHttpRequest');
    if (meta?.content) headers.set('X-CSRF-TOKEN', meta.content);
    if (options.body && !(options.body instanceof FormData) && typeof options.body !== 'string') {
        headers.set('Content-Type', 'application/json');
        options = { ...options, body: JSON.stringify(options.body) };
    }
    const request = typeof input === 'string' ? appUrl(input) : input;

    return fetch(request, { ...options, headers, credentials: 'same-origin' });
}

export function appUrl(path = '') {
    if (/^(https?:)?\/\//i.test(path)) {
        try {
            const parsed = new URL(path, window.location.origin);
            // Older settings may contain the local APP_URL. Storage assets must
            // follow the origin currently used by the browser (including a LAN IP).
            if (parsed.pathname.startsWith('/storage/')) {
                return new URL(`${appPath(parsed.pathname)}${parsed.search}${parsed.hash}`, window.location.origin).toString();
            }
        } catch {
            // Return the original value for non-URL strings; the browser will
            // surface a normal image error instead of breaking the page.
        }
        return path;
    }
    return new URL(appPath(path), window.location.origin).toString();
}

export { getBasePath };
