import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getSessionCookie } from '@/lib/cookies';
import { verifyJwt } from '@/lib/jwt';
import { User } from '@/models/User';

type LeanUser = { _id: string; name: string; email: string; role: string };

export async function GET() {
    try {
        const token = await getSessionCookie();
        if (!token) return NextResponse.json({ ok: false, user: null });

        const payload = verifyJwt<{ uid: string }>(token);
        if (!payload) return NextResponse.json({ ok: false, user: null });

        await dbConnect();
        const user = await User.findById(payload.uid)
            .select('name email role')
            .lean<LeanUser | null>();

        if (!user) return NextResponse.json({ ok: false, user: null });

        return NextResponse.json({
            ok: true,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch {
        return NextResponse.json({ ok: false, user: null });
    }
}
