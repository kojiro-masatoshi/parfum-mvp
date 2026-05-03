"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  AgeGroup,
  BudgetRange,
  DiagnosisAnswers,
  DietType,
  Gender,
  MBTI,
  MetabolismLevel,
  Preference,
  Scene,
  SkinType,
} from "@/lib/types";

type Question =
  | {
      key: "age";
      label: string;
      type: "single";
      options: readonly AgeGroup[];
    }
  | {
      key: "gender";
      label: string;
      type: "single";
      options: readonly Gender[];
    }
  | {
      key: "diet";
      label: string;
      type: "single";
      options: readonly DietType[];
    }
  | {
      key: "skin";
      label: string;
      type: "single";
      options: readonly SkinType[];
    }
  | {
      key: "metabolism";
      label: string;
      type: "single";
      options: readonly MetabolismLevel[];
    }
  | {
      key: "scenes";
      label: string;
      type: "multi";
      options: readonly Scene[];
    }
  | {
      key: "preferences";
      label: string;
      type: "multi";
      options: readonly Preference[];
    }
  | {
      key: "budget";
      label: string;
      type: "single";
      options: readonly BudgetRange[];
    }
  | {
      key: "mbti";
      label: string;
      type: "single";
      options: readonly MBTI[];
    };

const QUESTIONS: readonly Question[] = [
  {
    key: "age",
    label: "年齢層を教えてください",
    type: "single",
    options: ["10代", "20代", "30代", "40代", "50代以上"] as const,
  },
  {
    key: "gender",
    label: "性別を教えてください",
    type: "single",
    options: ["男性", "女性", "指定しない"] as const,
  },
  {
    key: "diet",
    label: "食生活の傾向は？",
    type: "single",
    options: ["和食中心", "洋食中心", "スパイス多め", "バランス型"] as const,
  },
  {
    key: "skin",
    label: "肌質は？",
    type: "single",
    options: ["乾燥肌", "普通肌", "脂性肌", "混合肌"] as const,
  },
  {
    key: "metabolism",
    label: "平熱・代謝は？",
    type: "single",
    options: ["低め", "普通", "高め"] as const,
  },
  {
    key: "scenes",
    label: "香水を使うシーン（複数選択可）",
    type: "multi",
    options: ["仕事", "デート", "休日", "フォーマル"] as const,
  },
  {
    key: "preferences",
    label: "好きな香りの方向性（複数選択可）",
    type: "multi",
    options: [
      "爽やか",
      "甘い",
      "落ち着いた木の香り",
      "スパイシー",
      "清潔感のある石鹸系",
      "個性的・独特",
    ] as const,
  },
  {
    key: "budget",
    label: "考えている価格帯は？",
    type: "single",
    options: [
      "〜¥15,000",
      "¥15,000〜¥30,000",
      "¥30,000〜",
      "こだわらない",
    ] as const,
  },
  {
    key: "mbti",
    label: "MBTI（わからない場合は一番下を選択）",
    type: "single",
    options: [
      "INTJ", "INTP", "ENTJ", "ENTP",
      "INFJ", "INFP", "ENFJ", "ENFP",
      "ISTJ", "ISFJ", "ESTJ", "ESFJ",
      "ISTP", "ISFP", "ESTP", "ESFP",
      "わからない",
    ] as const,
  },
];

type PartialAnswers = Partial<DiagnosisAnswers>;

export default function DiagnosisPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const q = QUESTIONS[index];

  const progress = Math.round(((index + 1) / QUESTIONS.length) * 100);
  const currentValue = answers[q.key];

  const isAnswered = (() => {
    if (q.type === "multi") {
      const v = currentValue as string[] | undefined;
      return Array.isArray(v) && v.length > 0;
    }
    return currentValue !== undefined;
  })();

  function setSingle<K extends Question["key"]>(key: K, value: string) {
    setAnswers((a) => ({ ...a, [key]: value }));
  }

  function toggleMulti<K extends Question["key"]>(key: K, value: string) {
    setAnswers((a) => {
      const prev = (a[key] as string[] | undefined) ?? [];
      const next = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];
      return { ...a, [key]: next };
    });
  }

  async function onNext() {
    if (index < QUESTIONS.length - 1) {
      setIndex(index + 1);
      return;
    }
    await submit();
  }

  async function submit() {
    setSubmitting(true);
    try {
      const minHold = new Promise((resolve) => setTimeout(resolve, 400));
      const fetchPromise = fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const [res] = await Promise.all([fetchPromise, minHold]);
      if (!res.ok) throw new Error("recommend failed");
      const data = await res.json();
      sessionStorage.setItem(
        "parfum:lastResult",
        JSON.stringify({ answers, recommendations: data.recommendations }),
      );
      sessionStorage.setItem("parfum:freshResult", "1");
      router.push("/result");
    } catch (e) {
      console.error(e);
      alert("レコメンド生成に失敗しました。しばらくしてお試しください。");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-10 fade-up" key={index}>
      <div className="space-y-3">
        <div className="flex items-center justify-between font-garamond text-[10px] tracking-[0.4em] text-neutral-400">
          <span>
            QUESTION {String(index + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-px w-full bg-accent/10">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 className="font-mincho text-2xl leading-[1.7] sm:text-3xl">
        {q.label}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {q.options.map((opt) => {
          const selected =
            q.type === "multi"
              ? ((answers[q.key] as string[] | undefined) ?? []).includes(opt)
              : answers[q.key] === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() =>
                q.type === "multi"
                  ? toggleMulti(q.key, opt)
                  : setSingle(q.key, opt)
              }
              className={[
                "rounded-sm px-5 py-4 text-left text-sm transition",
                selected
                  ? "bg-accent/[0.06] text-accent ring-1 ring-accent/30"
                  : "bg-white text-neutral-700 hover:bg-accent/[0.03] hover:text-accent/80",
              ].join(" ")}
            >
              <span className="font-mincho">{opt}</span>
            </button>
          );
        })}
      </div>

      {q.type === "multi" && (
        <p className="text-[11px] tracking-[0.15em] text-neutral-400">
          ※ 複数選択できます
        </p>
      )}

      <div className="flex items-center justify-between pt-8">
        <button
          type="button"
          onClick={() => setIndex(Math.max(0, index - 1))}
          disabled={index === 0 || submitting}
          className="font-garamond text-xs tracking-[0.3em] text-neutral-500 disabled:opacity-30"
        >
          ← BACK
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!isAnswered || submitting}
          className="rounded-full border border-accent px-10 py-3 font-mincho text-sm tracking-[0.2em] text-accent transition hover:bg-accent hover:text-white disabled:border-neutral-300 disabled:text-neutral-300 disabled:hover:bg-transparent"
        >
          {submitting
            ? "診断中…"
            : index < QUESTIONS.length - 1
              ? "次 へ"
              : "結果を見る"}
        </button>
      </div>
    </div>
  );
}
