'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type Role = 'user' | 'researcher';

type BaseForm = {
    fullName: string;
    email: string;
    phone: string;
    about: string;
    agreed: boolean;
};

type CreateRequestOk = { ok: true; id: string };
type CreateRequestErr = { ok: false; error?: string };
type CreateRequestResp = CreateRequestOk | CreateRequestErr;

export default function RequestTypePage() {
    const sp = useSearchParams();
    const router = useRouter();

    const [roleRequested, setRole] = useState<Role>('user');
    const [base, setBase] = useState<BaseForm>({
        fullName: '',
        email: '',
        phone: '',
        about: '',
        agreed: false,
    });

    useEffect(() => {
        setBase({
            fullName: sp.get('fullName') ?? '',
            email: sp.get('email') ?? '',
            phone: sp.get('phone') ?? '',
            about: sp.get('about') ?? '',
            agreed: sp.get('agreed') === 'true',
        });
    }, [sp]);

    async function next() {
        const params = new URLSearchParams();
        (Object.entries(base) as Array<[keyof BaseForm, string | boolean]>).forEach(
            ([k, v]) => params.set(k, String(v)),
        );
        params.set('roleRequested', roleRequested);

        if (roleRequested === 'researcher') {
            router.push(`/auth/request/researcher?${params.toString()}`);
            return;
        }

        const res = await fetch('/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...base, roleRequested }),
        });
        const data = (await res.json()) as CreateRequestResp;

        if (data.ok) router.push('/auth/request/sent');
        else alert(data.error ?? 'Помилка');
    }

    return (
        <main style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>
            <h1>Вибір ролі</h1>
            <label>
                <input
                    type="radio"
                    checked={roleRequested === 'user'}
                    onChange={() => setRole('user')}
                />
                Користувач
            </label>
            <br />
            <label>
                <input
                    type="radio"
                    checked={roleRequested === 'researcher'}
                    onChange={() => setRole('researcher')}
                />
                Дослідник
            </label>
            <br />
            <br />
            <button onClick={next}>Далі</button>
        </main>
    );
}
