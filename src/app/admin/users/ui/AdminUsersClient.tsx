'use client';
import { useEffect, useMemo, useState } from 'react';

type UserRole = 'admin'|'staff'|'user'|'researcher';
type UserRow = { _id: string; name: string; email: string; role: 'admin'|'staff'|'user'|'researcher'; createdAt: string };

type ListUsersResp = { ok: true; items: UserRow[] } | { ok: false; error: string };
type CreateUserReq = { name: string; email: string; password: string; role: UserRole };
type CreateUserResp = { ok: true; id: string; role: UserRole } | { ok: false; error: string };
type ChangeRoleResp = { ok: true; role: UserRole } | { ok: false; error: string };


export default function AdminUsersClient() {
    const [items, setItems] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string>('');

    const [form, setForm] = useState({ name:'', email:'', password:'', role:'admin' as UserRow['role'] });

    async function load() {
        setLoading(true); setErr('');
        const res = await fetch('/api/admin/users', { cache: 'no-store' });
        const data = await res.json();
        setLoading(false);
        if (data.ok) setItems(data.items);
        else setErr(data.error || 'Помилка завантаження');
    }

    useEffect(()=> { load(); }, []);

    async function createUser() {
        setErr('');
        const res = await fetch('/api/admin/users', {
            method:'POST',
            headers:{ 'Content-Type':'application/json' },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!data.ok) { setErr(data.error || 'Помилка створення'); return; }
        setForm({ name:'', email:'', password:'', role:'admin' });
        load();
    }

    async function changeRole(id: string, role: UserRow['role']) {
        setErr('');
        const res = await fetch(`/api/admin/users/${id}/role`, {
            method:'PATCH',
            headers:{ 'Content-Type':'application/json' },
            body: JSON.stringify({ role }),
        });
        const data = await res.json();
        if (!data.ok) { setErr(data.error || 'Помилка зміни ролі'); return; }
        load();
    }

    const roles = useMemo(() => (['admin','staff','user','researcher'] as const), []);

    return (
        <main style={{ maxWidth: 1000, margin: '40px auto', padding: 16 }}>
            <h1>Користувачі</h1>

            <section style={{ border:'1px solid #eee', padding:12, borderRadius:8, marginTop:12 }}>
                <h3>Створити користувача</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 160px auto', gap:8, alignItems:'end' }}>
                    <label>Імʼя<br/><input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} /></label>
                    <label>Email<br/><input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} /></label>
                    <label>Пароль<br/><input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} /></label>
                    <label>Роль<br/>
                        <select value={form.role} onChange={e=>setForm({...form, role:e.target.value as any})}>
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </label>
                    <button onClick={createUser} disabled={!form.name || !form.email || form.password.length<8}>Створити</button>
                </div>
            </section>

            <section style={{ marginTop:24 }}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <h3 style={{margin:0}}>Список користувачів</h3>
                    <button onClick={load} disabled={loading}>{loading?'Оновлення...':'Оновити'}</button>
                </div>
                {err && <p style={{ color:'crimson' }}>{err}</p>}
                <table border={1} cellPadding={6} style={{ width:'100%', marginTop:8 }}>
                    <thead>
                    <tr>
                        <th>Дата</th><th>Імʼя</th><th>Email</th><th>Роль</th><th>Дії</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map(u => (
                        <tr key={u._id}>
                            <td>{new Date(u.createdAt).toLocaleString()}</td>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>
                                <select value={u.role} onChange={e=>changeRole(u._id, e.target.value as any)}>
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </section>
        </main>
    );
}
