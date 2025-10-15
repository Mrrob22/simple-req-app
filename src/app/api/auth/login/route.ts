import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/cookies';
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) throw new Error('Missing email/password');

        await dbConnect();
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) throw new Error('Invalid credentials');
        if (!user.isActive) throw new Error('User is inactive');

        const access  = signAccessToken({ sub: user._id.toString(), role: user.role });
        const refresh = signRefreshToken({ sub: user._id.toString() });


        user.refreshTokenHash = await bcrypt.hash(refresh, 10); await user.save();

        setAuthCookies({ access, refresh });
        user.lastLoginAt = new Date(); await user.save();

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
}
