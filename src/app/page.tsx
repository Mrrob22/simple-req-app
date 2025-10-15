import Link from "next/link";

export default function Home() {
  return (
      <div style={{maxWidth:720, margin:'40px auto', padding:'0 16px'}}>
        <h1>Access Request — демо</h1>
        <p>Пройдіть короткий флоу створення заявки та модерації.</p>

        <ol>
          <li><Link href="/auth/request">/auth/request</Link> — базова форма</li>
          <li><Link href="/auth/request/type">/auth/request/type</Link> — вибір ролі</li>
          <li><Link href="/auth/request/researcher">/auth/request/researcher</Link> — додаткові поля (для дослідника)</li>
          <li><Link href="/admin/requests">/admin/requests</Link> — перегляд/апрув/відхилення (потрібен x-admin-key)</li>
          <li><Link href="/auth/login">/auth/login</Link> → <Link href="/auth/profile">/auth/profile</Link> — логін тимчасовим паролем з листа</li>
        </ol>

        <div style={{marginTop:24, display:'flex', gap:12}}>
          <Link href="/auth/request" style={{padding:'10px 14px', border:'1px solid #ddd', borderRadius:8}}>Створити заявку</Link>
          <Link href="/admin/requests" style={{padding:'10px 14px', border:'1px solid #ddd', borderRadius:8}}>Адмін заявки</Link>
        </div>
      </div>
  );
}
