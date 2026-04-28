import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16 fade-up">
      <section className="space-y-8 text-center">
        <p className="font-garamond text-[11px] tracking-[0.5em] text-accent">
          A SCENT FOR YOU
        </p>
        <h1 className="font-mincho text-4xl font-light leading-[1.5] sm:text-5xl">
          生活のリズムから、
          <br />
          あなたに馴染む香を。
        </h1>
        <div className="mx-auto h-px w-16 bg-[var(--rule)]" />
        <p className="mx-auto max-w-md text-sm leading-[2.1] text-neutral-600">
          食生活、肌質、代謝、そして日々のシーン。
          <br />
          九つの問いに答えるだけで、
          <br />
          あなたの輪郭に寄り添う香りを、五本ご提案します。
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Pillar
          label="01"
          title="九つの、問い"
          body="日々の食、肌の感触、季節の過ごし方。あなたの輪郭をたどります。"
        />
        <Pillar
          label="02"
          title="理由まで、言葉に"
          body="一本ずつに、なぜあなたに似合うのか。短い理由を添えて。"
        />
        <Pillar
          label="03"
          title="ノートの、解剖"
          body="トップ、ハート、ベース。香りの構造まで、静かに覗きに。"
        />
      </section>

      <div className="flex justify-center">
        <Link
          href="/diagnosis"
          className="rounded-full border border-accent px-12 py-4 font-mincho text-sm tracking-[0.3em] text-accent transition hover:bg-accent hover:text-white"
        >
          診断をはじめる
        </Link>
      </div>
    </div>
  );
}

function Pillar({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className="space-y-2 border-t rule pt-4">
      <p className="font-garamond text-[10px] tracking-[0.4em] text-neutral-400">
        {label}
      </p>
      <h3 className="font-mincho text-base">{title}</h3>
      <p className="text-xs leading-[1.9] text-neutral-600">{body}</p>
    </div>
  );
}
