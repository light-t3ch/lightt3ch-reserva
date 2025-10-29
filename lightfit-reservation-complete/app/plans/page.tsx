"use client";
import { useState } from "react";

const PLANS = [
  // planCode と priceId はStripeの実IDに置換してください
  { title: "55分 ×4回", planCode: "55m_x4", priceId: "price_1SMUOHGYZyRQVCKFlKHd9mmy", minutes: 55, sessions: 4 },
  { title: "55分 ×8回", planCode: "55m_x8", priceId: "price_XXXXXXXX", minutes: 55, sessions: 8 },
  { title: "25分 ×4回", planCode: "25m_x4", priceId: "price_XXXXXXXX", minutes: 25, sessions: 4 },
  { title: "25分 ×3回", planCode: "25m_x3", priceId: "price_XXXXXXXX", minutes: 25, sessions: 3 },
  { title: "25分 ×2回", planCode: "25m_x2", priceId: "price_XXXXXXXX", minutes: 25, sessions: 2 },
  { title: "25分 ×1回", planCode: "25m_x1", priceId: "price_XXXXXXXX", minutes: 25, sessions: 1 },
  { title: "55分 ×3回", planCode: "55m_x3", priceId: "price_1SMUOVGYZyRQVCKFaOT8Z3sb", minutes: 55, sessions: 3 },
  { title: "55分 ×2回", planCode: "55m_x2", priceId: "price_XXXXXXXX", minutes: 55, sessions: 2 },
  { title: "55分 ×1回", planCode: "55m_x1", priceId: "price_1SNQIgGYZyRQVCKFjVwMZ7pn", minutes: 55, sessions: 1 },
  { title: "55分 ×1回_追加専用（5回目以上の方専用）", planCode: "55m_x1", priceId: "price_1SNQI7GYZyRQVCKFGhtq80rx", minutes: 55, sessions: 1 },
];

export default function PlansPage() {
  const [email, setEmail] = useState("");

  async function checkout(priceId: string, planCode: string) {
    const res = await fetch("/api/checkout/session", {
      method: "POST",
      body: JSON.stringify({ priceId, planCode, email }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert("Checkout作成に失敗");
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-4">プランを選択</h1>
      <div className="mb-4">
        <input className="border p-2 w-full" placeholder="決済用メールアドレス" value={email} onChange={e=>setEmail(e.target.value)} />
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map(p => (
          <div key={p.planCode} className="border rounded-xl p-4">
            <h2 className="font-semibold">{p.title}</h2>
            <p className="text-sm text-gray-600 mb-3">{p.minutes}分 / 月{p.sessions}回</p>
            <button className="border px-4 py-2 rounded" onClick={()=>checkout(p.priceId, p.planCode)}>申し込む</button>
          </div>
        ))}
      </div>
    </main>
  );
}
