"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const r = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.ok) r.push("/dashboard");
    else alert("ログイン失敗");
  }

  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">ログイン</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="メール" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="パスワード" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="border px-4 py-2 rounded">ログイン</button>
      </form>
    </main>
  );
}
