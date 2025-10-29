
import "./globals.css";
import Link from "next/link";

export const metadata = { title: "LIGHT FIT 予約" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ fontFamily: "system-ui, -apple-system, Segoe UI" }}>
        <header className="p-4 border-b flex justify-between">
          <Link href="/">LIGHT FIT</Link>
          <nav className="space-x-4">
            <Link href="/plans">プラン</Link>
            <Link href="/login">ログイン</Link>
            <Link href="/dashboard">ダッシュボード</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
