'use client';
import { useState } from 'react';

export default function RequestBasePage() {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        about: '',
        agreed: false,
    });

    function next() {
        const params = new URLSearchParams();
        Object.entries(form).forEach(([k, v]) => params.set(k, String(v)));
        window.location.href = `/auth/request/type?${params.toString()}`;
    }

    return (
        <main style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>
            <h1>Запит на реєстрацію — базова форма</h1>

            <label>ПІБ<br/>
                <input value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} />
            </label><br/><br/>

            <label>Email<br/>
                <input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
            </label><br/><br/>

            <label>Телефон<br/>
                <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
            </label><br/><br/>

            <label>Про себе<br/>
                <textarea value={form.about} onChange={e=>setForm({...form, about:e.target.value})} />
            </label><br/><br/>

            <label>
                <input type="checkbox" checked={form.agreed} onChange={e=>setForm({...form, agreed:e.target.checked})}/>
                Погоджуюсь з обробкою даних
            </label><br/><br/>

            <button disabled={!form.fullName || !form.email || !form.agreed} onClick={next}>
                Далі
            </button>
        </main>
    );
}
