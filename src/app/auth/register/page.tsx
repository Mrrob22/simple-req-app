'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const r = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    async function submit() {
        setLoading(true); setErr('');
        const res = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name, email, password }) });
        const data = await res.json();
        setLoading(false);
        if (data.ok) r.push('/auth/login');
        else setErr(data.error || 'Помилка реєстрації');
    }

    return (
        <main style={{ maxWidth: 420, margin:'40px auto', padding:16 }}>
            <h1>Реєстрація</h1>
            <label>Імʼя<br/><input value={name} onChange={e=>setName(e.target.value)} /></label><br/><br/>
            <label>Email<br/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label><br/><br/>
            <label>Пароль<br/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label><br/><br/>
            {err && <p style={{color:'crimson'}}>{err}</p>}
            <button disabled={loading || !name || !email || password.length<8} onClick={submit}>{loading?'...':'Зареєструватися'}</button>
        </main>
    );
}
