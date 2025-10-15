import nodemailer from 'nodemailer';

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

function getTransporter() {
    if (!transporterPromise) {
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
        transporterPromise = Promise.resolve(
            nodemailer.createTransport({
                host: SMTP_HOST,
                port: Number(SMTP_PORT || 587),
                secure: false, 
                auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
            })
        );
    }
    return transporterPromise;
}

export async function sendMail(opts: { to: string | string[]; subject: string; html: string; }) {
    const { EMAIL_FROM } = process.env;
    const t = await getTransporter();
    await t.sendMail({
        from: EMAIL_FROM,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
    });
}
