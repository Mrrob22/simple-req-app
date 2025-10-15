import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { AccessRequest } from '@/models/AccessRequest';
import { User } from '@/models/User';
import { generatePlainPassword } from '@/lib/password';
import { sendMail } from '@/lib/email';
import { requireRole } from '@/lib/server-auth';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        await requireRole(['admin', 'staff']);
        await dbConnect();
        const item = await AccessRequest.findById(params.id).lean();
        if (!item) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
        return NextResponse.json({ ok: true, item });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message }, { status: e.status || 400 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        await requireRole(['admin', 'staff']);
        const body = await req.json().catch(() => ({} as any));
        const action = body?.action as 'approve' | 'reject';
        const comment = body?.comment || '';

        await dbConnect();
        const requestDoc = await AccessRequest.findById(params.id);
        if (!requestDoc) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
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

        return NextResponse.json({ ok: true, status: 'approved', userId: newUser._id });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message }, { status: e.status || 400 });
    }
}
