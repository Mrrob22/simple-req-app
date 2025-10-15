'use client';
import { useEffect, useState } from 'react';

export default function AdminRequestsPage() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function load() {
        setLoading(true);
        const res = await fetch('/api/requests', { headers: { 'x-admin-key': (window as any).ADMIN_API_KEY || '' }});
        const data = await res.json();
        setLoading(false);
        if (data.ok) setItems(data.items);
        else alert(data.error || 'Помилка');
    }

    useEffect(()=>{ load(); }, []);

    async function act(id: string, action: 'approve'|'reject') {
        const comment = action === 'reject' ? prompt('Причина відхилення?') || '' : '';
        const res = await fetch(`/api/requests/${id}`, {
            method: 'POST',
            headers: { 'Content-Type':'application/json', 'x-admin-key': (window as any).ADMIN_API_KEY || '' },
            body: JSON.stringify({ action, comment }),
        });
        const data = await res.json();
        if (data.ok) load(); else alert(data.error || 'Помилка');
    }

    return (
        <main style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
            <h1>Заявки</h1>
            <p style={{ fontSize:12, color:'#666' }}>
                Для демо — встав у консоль: <code>window.ADMIN_API_KEY = '{process.env.NEXT_PUBLIC_ADMIN_HINT||'your-key'}'</code>
            </p>
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
