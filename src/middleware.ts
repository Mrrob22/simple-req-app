import { NextResponse, NextRequest } from 'next/server';
import { verifyJwt } from './lib/jwt';

const USER_ONLY = ['/auth/profile'];
const ADMIN_ONLY_PREFIX = '/admin';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('session')?.value;

    const payload = token ? verifyJwt<{ role: string }>(token) : null;

    if (USER_ONLY.includes(pathname)) {
        if (!payload) return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    if (pathname.startsWith(ADMIN_ONLY_PREFIX)) {
        if (!payload || !['admin', 'staff'].includes(payload.role)) {
            return NextResponse.redirect(new URL('/auth/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/auth/profile', '/admin/:path*'],
};
