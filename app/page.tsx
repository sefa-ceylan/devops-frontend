"use client";

import { useEffect, useState, useCallback } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, BACKEND_URL, type Summary, type DailyPoint, type CategoryRow, type Health } from "@/lib/api";

const RANGES = [
  { label: "7 gün", days: 7 },
  { label: "30 gün", days: 30 },
  { label: "90 gün", days: 90 },
];

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days + 1);
  return d.toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const money = (n: number) =>
  n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Dashboard() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const [rangeDays, setRangeDays] = useState(30);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [daily, setDaily] = useState<DailyPoint[] | null>(null);
  const [categories, setCategories] = useState<CategoryRow[] | null>(null);
  const [health, setHealth] = useState<Health | null>(null);

  const load = useCallback(() => {
    const from = isoDaysAgo(rangeDays);
    const to = today();

    api
      .summary(from, to)
      .then(setSummary)
      .catch((err) => setError(err.message));

    api
      .daily(from, to)
      .then((res) => setDaily(res.days))
      .catch((err) => setError(err.message));

    api
      .categories(from, to)
      .then((res) => setCategories(res.categories))
      .catch((err) => setError(err.message));

    api
      .health()
      .then(setHealth)
      .catch(() => {});
  }, [rangeDays]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      {/* Başlık */}
      <header className="ruled border-b-2 border-ink pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="figure text-[11px] uppercase tracking-[0.22em] text-ledger">
              Mahalle Marketi · Amsterdam
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight">
              Satış Defteri
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            aria-label="Temayı değiştir"
            className="figure shrink-0 border border-rule px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            {dark ? "☀️ Aydınlık" : "🌙 Karanlık"}
          </button>
        </div>
      </header>

      {/* Dönem seçici */}
      <div className="mt-6 flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r.days}
            onClick={() => setRangeDays(r.days)}
            className={`figure border px-3 py-1.5 text-xs ${
              r.days === rangeDays
                ? "border-ink bg-ink text-paper"
                : "border-rule text-ink-soft"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6 border-l-4 border-stamp bg-stamp/5 px-4 py-3 text-stamp">
          Hata: {error} — backend {BACKEND_URL} adresinde çalışıyor mu kontrol et.
        </div>
      )}

      {/* KPI kartları */}
      {summary && (
        <section className="mt-8 grid grid-cols-2 gap-6 border-b border-rule pb-8 sm:grid-cols-4">
          <div>
            <p className="figure text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              Ciro
            </p>
            <p className="figure mt-1.5 text-2xl font-semibold">€{money(summary.revenue)}</p>
          </div>
          <div>
            <p className="figure text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              İşlem
            </p>
            <p className="figure mt-1.5 text-2xl font-semibold">{summary.transactions}</p>
          </div>
          <div>
            <p className="figure text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              Ort. Sepet
            </p>
            <p className="figure mt-1.5 text-2xl font-semibold">
              €{money(summary.averageBasket)}
            </p>
          </div>
          <div>
            <p className="figure text-[11px] uppercase tracking-[0.16em] text-ink-soft">
              En Çok Satan
            </p>
            <p className="figure mt-1.5 text-2xl font-semibold">
              {summary.topCategory.label}
            </p>
          </div>
        </section>
      )}

      {/* Ciro grafiği */}
      {daily && daily.length > 0 && (
        <section className="mt-10">
          <h2 className="figure text-[11px] uppercase tracking-[0.18em] text-ink-soft">
            Günlük Ciro
          </h2>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2f5d3a" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2f5d3a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#c9d0c4" strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d: string) => d.slice(5)}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} width={50} />
                <Tooltip formatter={(value) => [`€${money(Number(value))}`, "Ciro"]} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2f5d3a"
                  strokeWidth={2}
                  fill="url(#fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Kategori tablosu */}
      {categories && categories.length > 0 && (
        <section className="mt-10">
          <h2 className="figure text-[11px] uppercase tracking-[0.18em] text-ink-soft">
            Kategori Kırılımı
          </h2>
          <div className="mt-4 overflow-x-auto border-y-2 border-ink">
            <table className="w-full min-w-[480px] border-collapse">
              <thead>
                <tr className="border-b border-ink">
                  <th className="figure px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Kategori
                  </th>
                  <th className="figure px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Ciro
                  </th>
                  <th className="figure px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Adet
                  </th>
                  <th className="figure px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em]">
                    Pay
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((row) => (
                  <tr key={row.categoryId} className="ledger-row">
                    <td className="px-3 py-2.5 text-sm font-medium">{row.label}</td>
                    <td className="figure px-3 py-2.5 text-right text-sm">
                      €{money(row.revenue)}
                    </td>
                    <td className="figure px-3 py-2.5 text-right text-sm text-ink-soft">
                      {row.units}
                    </td>
                    <td className="figure px-3 py-2.5 text-right text-sm">
                      {row.sharePct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Versiyon / build bilgisi */}
      <footer className="mt-14 border-t border-rule pt-5">
        <dl className="figure flex flex-wrap gap-x-8 gap-y-2 text-[11px] text-ink-soft">
          <div className="flex gap-2">
            <dt className="uppercase tracking-[0.14em]">Frontend</dt>
            <dd className="text-ink">v1.0.0</dd>
          </div>
          <div className="flex gap-2">
            <dt className="uppercase tracking-[0.14em]">API</dt>
            <dd className={health ? "text-ink" : "text-stamp"}>
              {health ? `v${health.version} · ${health.status}` : "erişilemiyor"}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="uppercase tracking-[0.14em]">Kayıt</dt>
            <dd className="text-ink">{health ? health.recordCount : "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="uppercase tracking-[0.14em]">Kontrol</dt>
            <dd className="text-ink">
              {health ? new Date(health.checkedAt).toLocaleString("tr-TR") : "—"}
            </dd>
          </div>
        </dl>
      </footer>
    </main>
  );
}