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
        maxAge: 60 * 60 * 24 * 7, // 7 дней
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
