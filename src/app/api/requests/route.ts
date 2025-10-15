import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { AccessRequest } from '@/models/AccessRequest';
import { baseRequestSchema, typeSchema, researcherSchema } from '@/lib/validation';
import { sendMail } from '@/lib/email';
import { requireRole } from '@/lib/server-auth';

type AccessRequestItem = {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    about?: string;
    agreed: boolean;
    roleRequested: 'user' | 'researcher';
    status: 'pending' | 'approved' | 'rejected';
    directorLetterUrl?: string;
    createdAt: Date;
};

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

        const appUrl = process.env.APP_URL || '';
        const adminList: string[] = (process.env.ADMIN_NOTIFY_EMAILS || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        if (adminList.length) {
            await sendMail({
                to: adminList,
                subject: `Нова заявка: ${created.fullName} (${created.roleRequested})`,
                html: `
          <h2>Нова заявка</h2>
          <p><b>ПІБ:</b> ${created.fullName}<br/>
             <b>Email:</b> ${created.email}<br/>
             <b>Телефон:</b> ${created.phone || '-'}<br/>
             <b>Роль:</b> ${created.roleRequested}<br/>
             <b>Про себе:</b> ${created.about || '-'}<br/>
             <b>Посилання заяви директора:</b> ${created.directorLetterUrl || '-'}</p>
          <p><a href="${appUrl}/admin/requests">Відкрити список заявок</a></p>
        `,
            });
        }

        await sendMail({
            to: created.email,
            subject: 'Ваш запит отримано',
            html: `
        <p>Дякуємо, ${created.fullName}!</p>
        <p>Ми отримали ваш запит на доступ (${created.roleRequested}). Після модерації ви отримаєте лист із результатом.</p>
        <p>Якщо це були ви — нічого робити не потрібно.</p>
      `,
        });

        return NextResponse.json({ ok: true, id: created._id });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected error';
        return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
}

export async function GET() {
    try {
        await requireRole(['admin', 'staff']);
        await dbConnect();
        const list = await AccessRequest.find().sort({ createdAt: -1 }).lean<AccessRequestItem[]>();
        return NextResponse.json({ ok: true, items: list });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unexpected error';
        return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }
}
