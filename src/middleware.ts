import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const pathname = url.pathname;

    const token =
        req.cookies.get('session')?.value ||
        req.cookies.get('access_token')?.value ||
        null;

    if ((pathname.startsWith('/admin') || pathname === '/auth/profile')) {
        if (!token) {
            url.pathname = '/auth/login';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/auth/profile', '/admin/:path*'],
};
