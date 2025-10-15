import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireRole } from '@/lib/server-auth';
import { User } from '@/models/User';
import { z } from 'zod';

const createSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['admin', 'staff', 'user', 'researcher']).default('admin'),
});

type LeanUserItem = { _id: string; name: string; email: string; role: 'admin' | 'staff' | 'user' | 'researcher'; createdAt: Date };

export async function GET() {
    try {
        await requireRole(['admin', 'staff']);
        await dbConnect();
        const list = await User.find()
            .select('name email role createdAt')
            .sort({ createdAt: -1 })
            .lean<LeanUserItem[]>();
        return NextResponse.json({ ok: true, items: list });
    } catch (_e: unknown) {
        return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }
}

export async function POST(req: Request) {
    try {
        await requireRole(['admin']);
        const body = await req.json();
        const { name, email, password, role } = createSchema.parse(body);

        await dbConnect();
        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) return NextResponse.json({ ok: false, error: 'Email already exists' }, { status: 400 });

        const u = new User({ name, email, password, role });
        await u.save();

        return NextResponse.json({ ok: true, id: u._id, role: u.role });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected error';
        return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
}
