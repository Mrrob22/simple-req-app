'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'admin' | 'staff' | 'user' | 'researcher';

type MeUser = {
    id: string;
    name: string;
    email: string;
    role: Role;
};

type MeResp =
    | { ok: true; user: MeUser }
    | { ok: false; user: null };

export default function ProfilePage() {
    const r = useRouter();
    const [user, setUser] = useState<MeUser | null>(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then((res) => res.json())
            .then((d: MeResp) => {
                if (!d.ok || !d.user) r.push('/auth/login');
                else setUser(d.user);
            })
            .catch(() => r.push('/auth/login'));
    }, [r]);

    async function logout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        r.push('/auth/login');
    }

    if (!user) {
        return <main style={{ maxWidth: 640, margin: '40px auto' }}>Loading...</main>;
    }

    return (
        <main style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>
            <h1>Профіль</h1>
            <p><b>Імʼя:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Роль:</b> {user.role}</p>
            <button onClick={logout}>Вийти</button>
        </main>
    );
}
