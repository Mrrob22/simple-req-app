import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();
        if (!name || !email || !password) throw new Error('Missing fields');

        await dbConnect();
        const exists = await User.findOne({ email });
        if (exists) throw new Error('Email already in use');

        const user = new User({ name, email, password, role: 'user', isActive: true });
        await user.save();

        return NextResponse.json({ ok: true, userId: user._id });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
}
