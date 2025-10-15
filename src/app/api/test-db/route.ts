import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { AccessRequest } from '@/models/AccessRequest';

export async function GET() {
    try {
        const conn = await dbConnect();
        const count = await AccessRequest.countDocuments();
        return NextResponse.json({
            ok: true,
            connected: !!conn?.connection?.readyState,
            requestsCount: count,
        });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
    }
}
