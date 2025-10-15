'use client';
import { useEffect, useState } from 'react';

export default function AdminRequestsPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string>('');

    async function load() {
        setLoading(true); setErr('');
        const res = await fetch('/api/requests', { cache: 'no-store' });
        const data = await res.json();
        setLoading(false);
        if (data.ok) setItems(data.items);
        else setErr(data.error || 'Помилка');
    }

    useEffect(()=>{ load(); }, []);

    async function act(id: string, action: 'approve'|'reject') {
        const comment = action === 'reject' ? (prompt('Причина відхилення?') || '') : '';
        const res = await fetch(`/api/requests/${id}`, {
            method: 'POST',
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify({ action, comment }),
        });
        const data = await res.json();
        if (data.ok) load(); else setErr(data.error || 'Помилка');
    }

    return (
        <main style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
            <h1>Заявки</h1>
            {err && <p style={{ color:'crimson' }}>{err}</p>}
            <button onClick={load} disabled={loading}>{loading?'Оновлення...':'Оновити'}</button>
            <table border={1} cellPadding={6} style={{ width: '100%', marginTop: 16 }}>
                <thead>
                <tr>
                    <th>Дата</th><th>ПІБ</th><th>Email</th><th>Роль</th><th>Статус</th><th>Дії</th>
                </tr>
                </thead>
                <tbody>
                {items.map(it => (
                    <tr key={it._id}>
                        <td>{new Date(it.createdAt).toLocaleString()}</td>
                        <td>{it.fullName}</td>
                        <td>{it.email}</td>
                        <td>{it.roleRequested}</td>
                        <td>{it.status}</td>
                        <td>
                            {it.status === 'pending' && (
                                <>
                                    <button onClick={()=>act(it._id, 'approve')}>Approve</button>{' '}
                                    <button onClick={()=>act(it._id, 'reject')}>Reject</button>
                                </>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </main>
    );
}
