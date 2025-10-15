'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function RequestTypePage() {
    const sp = useSearchParams();
    const router = useRouter();
    const [roleRequested, setRole] = useState<'user'|'researcher'>('user');
    const [base, setBase] = useState<any>({});

    useEffect(()=> {
        setBase({
            fullName: sp.get('fullName')||'',
            email: sp.get('email')||'',
            phone: sp.get('phone')||'',
            about: sp.get('about')||'',
            agreed: sp.get('agreed') === 'true',
        });
    }, [sp]);

    function next() {
        const params = new URLSearchParams();
        Object.entries(base).forEach(([k,v])=>params.set(k, String(v)));
        params.set('roleRequested', roleRequested);
        if (roleRequested === 'researcher') {
            router.push(`/auth/request/researcher?${params.toString()}`);
        } else {
            // submit одразу
            fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type':'application/json' },
                body: JSON.stringify({ ...base, roleRequested })
            }).then(r=>r.json()).then(res=>{
                if (res.ok) router.push('/auth/request/sent');
                else alert(res.error||'Помилка');
            });
        }
    }

    return (
        <main style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>
            <h1>Вибір ролі</h1>
            <label>
                <input type="radio" checked={roleRequested==='user'} onChange={()=>setRole('user')} />
                Користувач
            </label>
            <br/>
            <label>
                <input type="radio" checked={roleRequested==='researcher'} onChange={()=>setRole('researcher')} />
                Дослідник
            </label>
            <br/><br/>
            <button onClick={next}>Далі</button>
        </main>
    );
}
