import { useMemo } from 'react';
import { appPath, getBasePath } from './api';

export function useRouter() {
    return useMemo(() => ({
        push: (url) => window.location.assign(appPath(url)),
        replace: (url) => window.location.replace(appPath(url)),
        back: () => window.history.back(),
        refresh: () => window.location.reload(),
    }), []);
}

export function useParams() {
    const basePath = getBasePath();
    const pathname = basePath && window.location.pathname.startsWith(basePath)
        ? window.location.pathname.slice(basePath.length)
        : window.location.pathname;
    const parts = pathname.split('/').filter(Boolean);
    return useMemo(() => {
        if (parts[0] === 'exam') return { sessionId: parts[1] };
        if (parts[0] === 'result') return { sessionId: parts[1] };
        if (parts[0] === 'demo' && parts[1] === 'result') return { demoId: parts[2] };
        if (parts[0] === 'demo') return { demoId: parts[1] };
        if (parts[0] === 'certificate' || parts[0] === 'verify') return { verificationCode: parts[1] };
        if (parts[0] === 'admin' && parts[1] === 'packages') return { packageId: parts[2] };
        return {};
    }, [parts.join('/')]);
}

export function useSearchParams() {
    return useMemo(() => new URLSearchParams(window.location.search), []);
}
