'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const r = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    async function submit() {
        setLoading(true); setErr('');
        const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email, password }) });
        const data = await res.json();
        setLoading(false);
        if (data.ok) r.push('/auth/profile');
        else setErr(data.error || 'Помилка входу');
    }

    return (
        <main style={{ maxWidth: 420, margin:'40px auto', padding:16 }}>
            <h1>Логін</h1>
            <label>Email<br/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label><br/><br/>
            <label>Пароль<br/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label><br/><br/>
            {err && <p style={{color:'crimson'}}>{err}</p>}
            <button disabled={loading || !email || !password} onClick={submit}>{loading?'...':'Увійти'}</button>
        </main>
    );
}
