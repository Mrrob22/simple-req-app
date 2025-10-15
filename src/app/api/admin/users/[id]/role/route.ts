import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireRole } from '@/lib/server-auth';
import { User } from '@/models/User';
import type { UserRole } from '@/models/User';
import { z } from 'zod';

const schema = z.object({ role: z.enum(['admin', 'staff', 'user', 'researcher']) });

type LeanUserRoleOnly = { _id: string; role: UserRole };

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        await requireRole(['admin']);
        const { role } = schema.parse(await req.json());

        await dbConnect();

        const updated = await User.findByIdAndUpdate(params.id, { role }, { new: true })
            .select('role')
            .lean<LeanUserRoleOnly | null>();

        if (!updated) {
            return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ ok: true, role: updated.role });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected error';
        return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
}
