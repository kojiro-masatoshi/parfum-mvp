"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DiagnosisAnswers, Recommendation } from "@/lib/types";

interface StoredResult {
  answers: DiagnosisAnswers;
  recommendations: Recommendation[];
}

export default function ResultPage() {
  const [data, setData] = useState<StoredResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("parfum:lastResult");
    if (raw) {
      try {
        setData(JSON.parse(raw) as StoredResult);
      } catch {
        // ignore
      }
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (!data) {
    return (
      <main className="space-y-6 pt-10 text-center">
        <p className="text-neutral-600">
          診断結果が見つかりませんでした。もう一度お試しください。
        </p>
        <Link
          href="/diagnosis"
          className="inline-block rounded-full bg-accent px-8 py-3 text-sm font-medium text-white"
        >
          診断を始める
        </Link>
      </main>
    );
  }

  return (
    <main className="space-y-8 pt-4">
      <header className="space-y-2">
        <p className="text-xs tracking-[0.3em] text-accent">YOUR PICK</p>
        <h1 className="text-2xl font-light">あなたに似合う5本</h1>
        <p className="text-sm text-neutral-600">
          スコア順に、理由とともにご紹介します。
        </p>
      </header>

      <ul className="space-y-4">
        {data.recommendations.map((r, i) => (
          <li
            key={r.perfume.id}
            className="rounded-md border border-neutral-200 p-5 transition hover:border-accent"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs text-neutral-400">#{i + 1}</p>
                <p className="text-xs text-neutral-500">{r.perfume.brand}</p>
                <h2 className="text-lg font-medium">{r.perfume.name}</h2>
                <p className="text-xs text-neutral-500">
                  {r.perfume.scent_family} ／ {r.perfume.concentration} ／ ¥
                  {r.perfume.price_yen.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-400">score</p>
                <p className="text-2xl font-light text-accent">
                  {r.score}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-700">
              {r.perfume.description}
            </p>
            <ul className="mt-3 space-y-1 text-xs text-neutral-600">
              {r.reasons.map((reason, idx) => (
                <li key={idx}>・{reason}</li>
              ))}
            </ul>
            <div className="mt-4">
              <Link
                href={`/perfumes/${r.perfume.id}`}
                className="text-xs text-accent underline-offset-4 hover:underline"
              >
                詳しく見る →
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-center pt-4">
        <Link
          href="/diagnosis"
          className="text-sm text-neutral-500 underline-offset-4 hover:underline"
        >
          もう一度診断する
        </Link>
      </div>
    </main>
  );
}
