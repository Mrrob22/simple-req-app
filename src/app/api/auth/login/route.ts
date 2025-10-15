import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/lib/jwt';
import { setSessionCookie } from '@/lib/cookies';
import { z } from 'zod';

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function POST(req: Request) {
    try {
        const { email, password } = schema.parse(await req.json());
        await dbConnect();

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });

        const token = signJwt({ uid: String(user._id), role: user.role, email: user.email });
        await setSessionCookie(token);

        user.lastLoginAt = new Date();
        await user.save();

        return NextResponse.json({ ok: true, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
}
