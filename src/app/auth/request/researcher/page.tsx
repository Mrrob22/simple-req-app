'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Role = 'user' | 'researcher';

type BaseForm = {
    fullName: string;
    email: string;
    phone: string;
    about: string;
    agreed: boolean;
    roleRequested: Role;
};

type PassportData = {
    series?: string;
    number?: string;
    issuedBy?: string;
    issuedAt?: string;
};

type ResearcherPayload = {
    directorLetterUrl: string;
    passport: PassportData;
};

type CreateRequestOk = { ok: true; id: string };
type CreateRequestErr = { ok: false; error?: string };
type CreateRequestResp = CreateRequestOk | CreateRequestErr;

export default function ResearcherPage() {
    const sp = useSearchParams();
    const router = useRouter();

    const [payload, setPayload] = useState<ResearcherPayload>({
        directorLetterUrl: '',
        passport: { series: '', number: '', issuedBy: '', issuedAt: '' },
    });

    const [base, setBase] = useState<BaseForm>({
        fullName: '',
        email: '',
        phone: '',
        about: '',
        agreed: false,
        roleRequested: 'researcher',
    });

    useEffect(() => {
        setBase({
            fullName: sp.get('fullName') ?? '',
            email: sp.get('email') ?? '',
            phone: sp.get('phone') ?? '',
            about: sp.get('about') ?? '',
            agreed: sp.get('agreed') === 'true',
            roleRequested: 'researcher',
        });
    }, [sp]);

    async function submit() {
        const res = await fetch('/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...base, ...payload }),
        });
        const data = (await res.json()) as CreateRequestResp;

        if (data.ok) router.push('/auth/request/sent');
        else alert(data.error ?? 'Помилка');
    }

    return (
        <main style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>
            <h1>Додаткові дані для дослідника</h1>

            <label>
                URL заяви директора
                <br />
                <input
                    value={payload.directorLetterUrl}
                    onChange={(e) =>
                        setPayload({ ...payload, directorLetterUrl: e.target.value })
                    }
                />
            </label>
            <br />
            <br />

            <fieldset style={{ border: '1px solid #ddd', padding: 12 }}>
                <legend>Паспортні дані</legend>

                <label>
                    Серія
                    <br />
                    <input
                        value={payload.passport.series ?? ''}
                        onChange={(e) =>
                            setPayload({
                                ...payload,
                                passport: { ...payload.passport, series: e.target.value },
                            })
                        }
                    />
                </label>
                <br />

                <label>
                    Номер
                    <br />
                    <input
                        value={payload.passport.number ?? ''}
                        onChange={(e) =>
                            setPayload({
                                ...payload,
                                passport: { ...payload.passport, number: e.target.value },
                            })
                        }
                    />
                </label>
                <br />

                <label>
                    Ким виданий
                    <br />
                    <input
                        value={payload.passport.issuedBy ?? ''}
                        onChange={(e) =>
                            setPayload({
                                ...payload,
                                passport: { ...payload.passport, issuedBy: e.target.value },
                            })
                        }
                    />
                </label>
                <br />

                <label>
                    Коли виданий
                    <br />
                    <input
                        value={payload.passport.issuedAt ?? ''}
                        onChange={(e) =>
                            setPayload({
                                ...payload,
                                passport: { ...payload.passport, issuedAt: e.target.value },
                            })
                        }
                    />
                </label>
            </fieldset>

            <br />
            <button onClick={submit}>Надіслати</button>
        </main>
    );
}
