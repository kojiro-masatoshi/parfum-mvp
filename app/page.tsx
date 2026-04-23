import Link from "next/link";

export default function Home() {
  return (
    <main className="space-y-10">
      <header className="space-y-3 pt-6">
        <p className="text-xs tracking-[0.3em] text-accent">PARFUM MVP</p>
        <h1 className="text-3xl font-light leading-tight sm:text-4xl">
          生活のリズムから、
          <br />
          あなたに馴染む香水を。
        </h1>
        <p className="text-sm leading-relaxed text-neutral-600">
          食生活、肌質、代謝、そして日々のシーン。
          <br />
          8つの問いに答えるだけで、相性の良い香りを5本ご提案します。
        </p>
      </header>

      <section className="space-y-4 rounded-md border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="text-sm font-medium text-neutral-700">このアプリについて</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-neutral-600">
          <li>・外部APIを一切使わず、ローカルのルールベースで完結します。</li>
          <li>・提案にはそれぞれ「なぜ選ばれたか」の理由が付きます。</li>
          <li>・所要時間は約2〜3分です。</li>
        </ul>
      </section>

      <div className="flex justify-center pt-4">
        <Link
          href="/diagnosis"
          className="rounded-full bg-accent px-10 py-3 text-sm font-medium text-white transition hover:bg-accent-soft"
        >
          診断を始める
        </Link>
      </div>
    </main>
  );
}
