import { NextResponse, NextRequest } from 'next/server';
import { dbConnect } from '@/lib/db';
import { AccessRequest } from '@/models/AccessRequest';
import { User } from '@/models/User';
import { generatePlainPassword } from '@/lib/password';
import { sendMail } from '@/lib/email';
import { requireRole } from '@/lib/server-auth';
import type { Types } from 'mongoose';

type RoleRequested = 'user' | 'researcher';
type RequestStatus = 'pending' | 'approved' | 'rejected';

type AccessRequestLean = {
    _id: Types.ObjectId;
    fullName: string;
    email: string;
    phone?: string;
    about?: string;
    roleRequested: RoleRequested;
    status: RequestStatus;
    directorLetterUrl?: string;
    reviewedBy?: string | null;
    reviewComment?: string | null;
    createdUserId?: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
};

type ActionBody = {
    action?: 'approve' | 'reject';
    comment?: string;
};

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await requireRole(['admin', 'staff']);
        const { id } = await context.params;

        await dbConnect();
        const item = await AccessRequest.findById(id).lean<AccessRequestLean | null>();
        if (!item) {
            return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ ok: true, item });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected error';
        return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
}

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await requireRole(['admin', 'staff']);

        let parsed: ActionBody = {};
        try {
            parsed = (await req.json()) as ActionBody;
        } catch {
            parsed = {};
        }

        const action = parsed.action;
        const comment = parsed.comment ?? '';
        if (action !== 'approve' && action !== 'reject') {
            return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
        }

        const { id } = await context.params;

        await dbConnect();
        const requestDoc = await AccessRequest.findById(id);
        if (!requestDoc) {
            return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
        }
        if (requestDoc.status !== 'pending') {
            return NextResponse.json({ ok: false, error: 'Already reviewed' }, { status: 400 });
        }

        if (action === 'reject') {
            requestDoc.status = 'rejected';
            requestDoc.reviewedBy = 'admin';
            requestDoc.reviewComment = comment;
            await requestDoc.save();
            return NextResponse.json({ ok: true, status: 'rejected' });
        }

        const plainPass = generatePlainPassword(10);
        const newUser = new User({
            name: requestDoc.fullName,
            email: requestDoc.email,
            password: plainPass,
            role: requestDoc.roleRequested === 'researcher' ? 'researcher' : 'user',
            isActive: true,
        });
        await newUser.save();

        requestDoc.status = 'approved';
        requestDoc.reviewedBy = 'admin';
        requestDoc.createdUserId = newUser._id;
        requestDoc.reviewComment = comment;
        await requestDoc.save();

        const appUrl = process.env.APP_URL || '';
        await sendMail({
            to: requestDoc.email,
            subject: 'Ваш доступ схвалено',
            html: `
        <p>Вітаємо, ${requestDoc.fullName}!</p>
        <p>Ваш обліковий запис створено.</p>
        <p><b>Логін (email):</b> ${requestDoc.email}<br/>
           <b>Тимчасовий пароль:</b> ${plainPass}</p>
        <p>Вхід: <a href="${appUrl}/auth/login">${appUrl}/auth/login</a></p>
      `,
        });

        return NextResponse.json({
            ok: true,
            status: 'approved',
            userId: String(newUser._id),
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected error';
        return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
}
