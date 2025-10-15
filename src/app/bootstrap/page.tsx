'use client';
import { useState } from 'react';

export default function BootstrapAdminPage() {
    const [form, setForm] = useState({ name:'', email:'', password:'', token:'' });
    const [msg, setMsg] = useState<string>('');

    async function submit() {
        setMsg('');
        const res = await fetch('/api/bootstrap/admin', {
            method: 'POST',
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.ok) {
            setMsg('Адміна створено. Тепер можна увійти на /auth/login');
            setForm({ name:'', email:'', password:'', token:'' });
        } else {
            setMsg(`Помилка: ${data.error || 'невідомо'}`);
        }
    }

    return (
        <main style={{ maxWidth: 520, margin:'40px auto', padding:16 }}>
            <h1>Bootstrap: створення адміністратора</h1>
            <p style={{ fontSize:12, color:'#666' }}>
                Ця сторінка тимчасова. Після успішного створення адміна — видали її і змінну BOOTSTRAP_TOKEN.
            </p>
            <label>Імʼя<br/>
                <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
            </label><br/><br/>
            <label>Email<br/>
                <input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
            </label><br/><br/>
            <label>Пароль (мін. 8 символів)<br/>
                <input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
            </label><br/><br/>
            <label>Bootstrap-token<br/>
                <input value={form.token} onChange={e=>setForm({...form, token:e.target.value})} />
            </label><br/><br/>
            <button
                onClick={submit}
                disabled={!form.name || !form.email || form.password.length < 8 || form.token.length < 10}
            >
                Створити адміністратора
            </button>
            {msg && <p style={{ marginTop:12 }}>{msg}</p>}
        </main>
    );
}
