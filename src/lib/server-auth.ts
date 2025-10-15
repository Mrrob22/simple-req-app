import { dbConnect } from '@/lib/db';
import { getSessionCookie } from '@/lib/cookies';
import { verifyJwt } from '@/lib/jwt';
import { User } from '@/models/User';

export type CurrentUser = { id: string; email: string; name: string; role: 'admin'|'staff'|'user'|'researcher' };

export async function getCurrentUser(): Promise<CurrentUser | null> {
    const token = await getSessionCookie();
    if (!token) return null;
    const payload = verifyJwt<{ uid: string }>(token);
    if (!payload?.uid) return null;

    await dbConnect();
    const u = await User.findById(payload.uid)
        .select('name email role')
        .lean<{ _id: any; name: string; email: string; role: CurrentUser['role'] } | null>();

    return u ? { id: String(u._id), name: u.name, email: u.email, role: u.role } : null;
}

export async function requireRole(roles: Array<CurrentUser['role']>) {
    const me = await getCurrentUser();
    if (!me || !roles.includes(me.role)) {
        const err: any = new Error('Forbidden');
        err.status = 403;
        throw err;
    }
    return me;
}
