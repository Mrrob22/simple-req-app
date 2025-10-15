import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { AccessRequest } from '@/models/AccessRequest';
import { baseRequestSchema, typeSchema, researcherSchema } from '@/lib/validation';
import { assertAdminKey } from '@/lib/adminAuth';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        baseRequestSchema.parse(body);
        typeSchema.parse(body);
        if (body.roleRequested === 'researcher') {
            researcherSchema.parse({ passport: body.passport, directorLetterUrl: body.directorLetterUrl });
        }

        await dbConnect();
        const created = await AccessRequest.create({
            fullName: body.fullName,
            email: body.email,
            phone: body.phone || '',
            about: body.about || '',
            agreed: body.agreed === true,
            roleRequested: body.roleRequested,
            passport: body.passport || {},
            directorLetterUrl: body.directorLetterUrl || '',
            status: 'pending',
        });

        return NextResponse.json({ ok: true, id: created._id });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
}

export async function GET(req: Request) {
    try {
        assertAdminKey(req.headers);
        await dbConnect();
        const list = await AccessRequest.find().sort({ createdAt: -1 }).lean();
        return NextResponse.json({ ok: true, items: list });
    } catch (e: any) {
        const status = e.status || 400;
        return NextResponse.json({ ok: false, error: e.message }, { status });
    }
}
