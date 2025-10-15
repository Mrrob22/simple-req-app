import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';
import { z } from 'zod';

const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    token: z.string().min(10),
});

export async function POST(req: Request) {
    try {
        const { name, email, password, token } = schema.parse(await req.json());

        if (!process.env.BOOTSTRAP_TOKEN) {
            return NextResponse.json({ ok: false, error: 'Server not configured (BOOTSTRAP_TOKEN missing)' }, { status: 500 });
        }
        if (token !== process.env.BOOTSTRAP_TOKEN) {
            return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 401 });
        }

        await dbConnect();

        const adminsCount = await User.countDocuments({ role: 'admin' });
        if (adminsCount > 0) {
            return NextResponse.json({ ok: false, error: 'Admin already exists' }, { status: 409 });
        }

        const u = new User({ name, email, password, role: 'admin' });
        await u.save();

        return NextResponse.json({ ok: true, id: String(u._id), email: u.email, role: u.role });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
}
