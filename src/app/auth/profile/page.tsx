'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const r = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(()=> {
        fetch('/api/auth/me').then(r=>r.json()).then(d=>{
            if (!d.ok || !d.user) r.push('/auth/login');
            else setUser(d.user);
        });
    }, [r]);

    async function logout() {
        await fetch('/api/auth/logout', { method:'POST' });
        r.push('/auth/login');
    }

    if (!user) return <main style={{maxWidth:640, margin:'40px auto'}}>Loading...</main>;

    return (
        <main style={{ maxWidth: 640, margin:'40px auto', padding:16 }}>
            <h1>Профіль</h1>
            <p><b>Імʼя:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Роль:</b> {user.role}</p>
            <button onClick={logout}>Вийти</button>
        </main>
    );
}
