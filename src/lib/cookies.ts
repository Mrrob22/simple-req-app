import { cookies } from 'next/headers';

const COOKIE_NAME = 'session';

export async function setSessionCookie(token: string) {
    const store = await cookies();
    store.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    });
}

export async function clearSessionCookie() {
    const store = await cookies();
    store.set({
        name: COOKIE_NAME,
        value: '',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
    });
}

export async function getSessionCookie() {
    const store = await cookies();
    return store.get(COOKIE_NAME)?.value || null;
}

const base = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/' };

export async function setAuthCookies(tokens: { access: string; refresh: string }) {
    const store = await cookies();
    store.set({ name: 'access_token',  value: tokens.access,  ...base, maxAge: 60 * 60 * 24 * 7 });
    store.set({ name: 'refresh_token', value: tokens.refresh, ...base, maxAge: 60 * 60 * 24 * 30 });
}