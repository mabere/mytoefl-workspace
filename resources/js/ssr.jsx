import React from 'react';
import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { renderToString } from 'react-dom/server';

const pages = import.meta.glob('./Pages/**/*.{jsx,tsx}', { eager: true });

function resolvePage(name) {
    const module = pages[`./Pages/${name}.jsx`] || pages[`./Pages/${name}.tsx`];

    if (!module) {
        throw new Error(`Inertia page not found: ${name}`);
    }

    return module.default || module;
}

createServer((page) => createInertiaApp({
    page,
    render: renderToString,
    resolve: resolvePage,
    setup: ({ App, props }) => (
        <App
            {...props}
            children={({ Component, props: pageProps, key }) => (
                <Component {...pageProps} key={key} />
            )}
        />
    ),
}));
