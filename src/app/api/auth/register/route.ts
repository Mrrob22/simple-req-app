import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';
import { z } from 'zod';

const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = schema.parse(body);
        await dbConnect();

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return NextResponse.json({ ok: false, error: 'Email already in use' }, { status: 400 });

        const user = new User({ name, email, password, role: 'user' });
        await user.save();

        return NextResponse.json({ ok: true, userId: user._id });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
}
