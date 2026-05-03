"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { meshGradientFor, themeOf } from "@/lib/scent-theme";
import type { DiagnosisAnswers, Recommendation } from "@/lib/types";

interface StoredResult {
  answers: DiagnosisAnswers;
  recommendations: Recommendation[];
}

type Phase = "intro" | "reveal";

export default function ResultPage() {
  const [data, setData] = useState<StoredResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [phase, setPhase] = useState<Phase>("reveal");

  useEffect(() => {
    const raw = sessionStorage.getItem("parfum:lastResult");
    if (raw) {
      try {
        setData(JSON.parse(raw) as StoredResult);
      } catch {
        // ignore
      }
    }
    // 診断直後の遷移時のみイントロを再生
    const fresh = sessionStorage.getItem("parfum:freshResult");
    if (fresh) {
      sessionStorage.removeItem("parfum:freshResult");
      setPhase("intro");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (phase !== "intro") return;
    const t = setTimeout(() => setPhase("reveal"), 1800);
    return () => clearTimeout(t);
  }, [phase]);

  if (!loaded) return null;

  if (data && phase === "intro") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
        <p className="font-garamond text-[10px] tracking-[0.5em] text-neutral-400 intro-breathe">
          SELECTING…
        </p>
        <p className="font-mincho text-xl text-neutral-700 intro-breathe">
          あなたの輪郭を、辿っています。
        </p>
        <div className="h-px w-24 bg-accent intro-line" />
      </div>
    );
  }

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
    <div className="space-y-12">
      <header className="space-y-4 text-center fade-up">
        <p className="font-garamond text-[11px] tracking-[0.5em] text-accent">
          YOUR SELECTION
        </p>
        <h1 className="font-mincho text-3xl font-light sm:text-4xl">
          あなたに似合う、五本。
        </h1>
        <div className="mx-auto h-px w-12 bg-accent/30" />
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
              className="fade-up relative overflow-hidden rounded-sm bg-white transition"
              style={{
                boxShadow: `inset 3px 0 0 ${theme.accent}`,
                animationDelay: `${i * 110}ms`,
              }}
            >
              <div
                className="pointer-events-none absolute inset-y-0 right-0 w-[60%]"
                style={{
                  background: meshGradientFor(theme, r.perfume.id),
                  filter: "blur(18px)",
                  transform: "scale(1.08)",
                  WebkitMaskImage:
                    "linear-gradient(270deg, black 50%, transparent 100%)",
                  maskImage:
                    "linear-gradient(270deg, black 50%, transparent 100%)",
                  opacity: 0.9,
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

      <div
        className="fade-up flex justify-center pt-4"
        style={{ animationDelay: `${data.recommendations.length * 110 + 80}ms` }}
      >
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
