"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { themeOf } from "@/lib/scent-theme";
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
      <div className="space-y-8 pt-10 text-center fade-up">
        <p className="font-mincho text-lg text-neutral-600">
          診断結果が見つかりませんでした。
        </p>
        <Link
          href="/diagnosis"
          className="inline-block rounded-full border border-accent px-10 py-3 font-mincho text-sm tracking-[0.2em] text-accent transition hover:bg-accent hover:text-white"
        >
          診断をはじめる
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 fade-up">
      <header className="space-y-4 text-center">
        <p className="font-garamond text-[11px] tracking-[0.5em] text-accent">
          YOUR SELECTION
        </p>
        <h1 className="font-mincho text-3xl font-light sm:text-4xl">
          あなたに似合う、五本。
        </h1>
        <div className="mx-auto h-px w-12 bg-[var(--rule)]" />
        <p className="text-xs leading-[2] text-neutral-500">
          スコア順に、そして理由とともに。
        </p>
      </header>

      <ul className="space-y-6">
        {data.recommendations.map((r, i) => {
          const theme = themeOf(r.perfume.scent_family);
          return (
            <li
              key={r.perfume.id}
              className="relative overflow-hidden rounded-sm border border-[var(--rule)] bg-white transition hover:shadow-[0_1px_0_rgba(0,0,0,0.05)]"
              style={{ borderLeftColor: theme.accent, borderLeftWidth: 3 }}
            >
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-1/3 opacity-60"
                style={{
                  background: `linear-gradient(270deg, ${theme.tint} 0%, transparent 100%)`,
                }}
              />
              <div className="relative flex items-start gap-6 p-6">
                <div className="flex-none text-center">
                  <p className="font-garamond text-[10px] tracking-[0.3em] text-neutral-400">
                    N°
                  </p>
                  <p className="font-mincho text-4xl leading-none text-neutral-800">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <p className="font-garamond text-[10px] tracking-[0.3em] text-neutral-400">
                      {r.perfume.brand.toUpperCase()}
                    </p>
                    <h2 className="font-mincho text-xl text-neutral-900">
                      {r.perfume.name}
                    </h2>
                    <p
                      className="inline-flex items-center gap-2 pt-1 font-garamond text-[10px] tracking-[0.3em]"
                      style={{ color: theme.accent }}
                    >
                      <span
                        className="inline-block h-[6px] w-[6px] rounded-full"
                        style={{ background: theme.accent }}
                      />
                      {theme.label.toUpperCase()}
                      <span className="vertical-rule" />
                      <span className="text-neutral-400">
                        {r.perfume.concentration}
                      </span>
                      <span className="vertical-rule" />
                      <span className="text-neutral-400">
                        ¥{r.perfume.price_yen.toLocaleString()}
                      </span>
                    </p>
                  </div>

                  <p className="font-mincho text-sm leading-[2] text-neutral-700">
                    {r.perfume.description}
                  </p>

                  <ul className="space-y-1 border-l pl-4 text-xs leading-[1.9] text-neutral-600" style={{ borderColor: theme.accent }}>
                    {r.reasons.map((reason, idx) => (
                      <li key={idx}>— {reason}</li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between pt-2">
                    <Link
                      href={`/perfumes/${r.perfume.id}`}
                      className="font-garamond text-[11px] tracking-[0.3em] text-accent underline-offset-4 hover:underline"
                    >
                      READ MORE →
                    </Link>
                    <div className="text-right">
                      <p className="font-garamond text-[9px] tracking-[0.3em] text-neutral-400">
                        SCORE
                      </p>
                      <p
                        className="font-mincho text-2xl leading-none"
                        style={{ color: theme.accent }}
                      >
                        {r.score}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-center pt-4">
        <Link
          href="/diagnosis"
          className="font-garamond text-[11px] tracking-[0.3em] text-neutral-500 underline-offset-4 hover:underline"
        >
          TAKE AGAIN ↻
        </Link>
      </div>
    </div>
  );
}
