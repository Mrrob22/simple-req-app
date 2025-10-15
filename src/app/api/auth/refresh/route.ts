import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyRefresh, signAccessToken, signRefreshToken } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/cookies';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('refresh_token')?.value;
        if (!token) throw new Error('No refresh token');
        const payload = verifyRefresh(token) as any;

        const access  = signAccessToken({ sub: payload.sub });
        const refresh = signRefreshToken({ sub: payload.sub });
        setAuthCookies({ access, refresh });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: 'Invalid refresh' }, { status: 401 });
    }
}
