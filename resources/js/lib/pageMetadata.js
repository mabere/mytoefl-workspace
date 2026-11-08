export function pageMetadata(pathname) {
    if (pathname === '/') {
        return { title: 'TOEFL ITP Practice & Test Portal', description: 'Portal latihan, simulasi, dan ujian TOEFL ITP dengan alur terukur, audio terkontrol, dan laporan hasil yang jelas.', indexable: true };
    }
    if (pathname === '/login') {
        return { title: 'Masuk Akun Peserta - TOEFL ITP', description: 'Masuk ke akun peserta untuk melanjutkan pendaftaran, jadwal, dan hasil ujian TOEFL ITP.', indexable: false };
    }
    if (pathname === '/register') {
        return { title: 'Daftar Akun Peserta - TOEFL ITP', description: 'Buat akun peserta untuk mengikuti layanan ujian TOEFL ITP.', indexable: false };
    }
    if (pathname === '/privacy') {
        return { title: 'Kebijakan Privasi - TOEFL ITP', description: 'Kebijakan pengelolaan data peserta pada platform ujian TOEFL ITP.', indexable: true };
    }
    if (pathname === '/terms') {
        return { title: 'Syarat dan Ketentuan - TOEFL ITP', description: 'Syarat penggunaan layanan dan pelaksanaan ujian TOEFL ITP.', indexable: true };
    }
    if (pathname === '/thank-you') {
        return { title: 'Terima Kasih - TOEFL ITP', description: 'Konfirmasi proses Anda pada platform ujian TOEFL ITP.', indexable: false };
    }
    if (pathname.startsWith('/verify/')) {
        return { title: 'Verifikasi Sertifikat TOEFL ITP', description: 'Halaman verifikasi sertifikat digital TOEFL ITP.', indexable: false };
    }
    if (pathname.startsWith('/certificate/')) {
        return { title: 'Sertifikat TOEFL ITP', description: 'Dokumen sertifikat digital TOEFL ITP.', indexable: false };
    }
    if (pathname.startsWith('/admin')) {
        return { title: 'Panel Administrasi - TOEFL ITP', description: 'Panel pengelolaan operasional ujian TOEFL ITP.', indexable: false };
    }
    if (pathname.startsWith('/exam/')) {
        return { title: 'Ruang Ujian TOEFL ITP', description: 'Ruang ujian TOEFL ITP peserta.', indexable: false };
    }
    if (pathname.startsWith('/student/')) {
        return { title: 'Dashboard Peserta TOEFL ITP', description: 'Dashboard peserta untuk jadwal, pendaftaran, dan hasil ujian.', indexable: false };
    }
    if (pathname.startsWith('/result/')) {
        return { title: 'Hasil Ujian TOEFL ITP', description: 'Laporan hasil ujian TOEFL ITP peserta.', indexable: false };
    }
    if (pathname.startsWith('/demo/')) {
        return { title: 'Simulasi Demo TOEFL ITP', description: 'Simulasi ujian TOEFL ITP dengan alur dan waktu terukur.', indexable: false };
    }

    return { title: 'TOEFL ITP', description: 'Platform ujian TOEFL ITP.', indexable: false };
}

export function siteOrigin(pageProps = {}) {
    const sharedOrigin = pageProps?.site?.origin;

    if (sharedOrigin) {
        return String(sharedOrigin).replace(/\/$/, '');
    }

    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    return 'http://localhost';
}

export function absoluteSiteUrl(pathname, pageProps = {}) {
    const origin = siteOrigin(pageProps);
    const parsed = new URL(origin, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    const configuredBasePath = parsed.pathname.replace(/\/+$/, '');
    const routePath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    const targetPath = configuredBasePath
        ? `${configuredBasePath}${routePath === '/' ? '/' : routePath}`
        : appPath(routePath);

    return `${parsed.origin}${targetPath}`;
}
import { appPath } from './api';
