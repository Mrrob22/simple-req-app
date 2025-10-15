import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Access Request MVP",
  description: "Заявки на доступ: користувач/дослідник + модерація + email",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="uk">
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{minHeight:'100vh', display:'flex', flexDirection:'column'}}>
      <header style={{borderBottom:'1px solid #eee', padding:'12px 16px', display:'flex', gap:12}}>
        <Link href="/">Головна</Link>
        <Link href="/auth/request">Запит доступу</Link>
        <Link href="/admin/requests">Адмін заявки</Link>
        <span style={{marginLeft:'auto'}} />
        <Link href="/auth/login">Логін</Link>
        <Link href="/auth/profile">Профіль</Link>
        <Link href="/admin/users">Адмін • Користувачі</Link>
      </header>
      <main style={{flex:1}}>{children}</main>
      <footer style={{borderTop:'1px solid #eee', padding:'12px 16px', fontSize:12, color:'#777'}}>
        © {new Date().getFullYear()} Access Request MVP
      </footer>
      </body>
      </html>
  );
}
