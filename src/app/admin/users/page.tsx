import { requireRole } from '@/lib/server-auth';
import AdminUsersClient from './ui/AdminUsersClient';

export default async function AdminUsersPage() {
    await requireRole(['admin','staff']);
    return <AdminUsersClient />;
}
