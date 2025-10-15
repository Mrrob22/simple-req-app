import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyRefresh, signAccessToken, signRefreshToken } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/cookies';

export async function POST() {
    try {
        const store = await cookies();
        const token = store.get('refresh_token')?.value;
        if (!token) {
            return NextResponse.json({ ok: false, error: 'No refresh token' }, { status: 401 });
        }

        const payload = verifyRefresh<{ sub: string; role?: string; email?: string }>(token);
        if (!payload || !payload.sub) {
            return NextResponse.json({ ok: false, error: 'Invalid refresh token' }, { status: 401 });
        }

        const access  = signAccessToken({ sub: payload.sub, role: payload.role, email: payload.email }); // 15 мин
        const refresh = signRefreshToken({ sub: payload.sub });                                          // 30 дней

        await setAuthCookies({ access, refresh });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false, error: 'Invalid refresh' }, { status: 401 });
    }
}
