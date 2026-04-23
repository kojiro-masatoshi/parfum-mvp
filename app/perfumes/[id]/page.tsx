import { notFound } from "next/navigation";
import Link from "next/link";
import { getPerfumeById } from "@/lib/db";

interface Params {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export default function PerfumeDetailPage({ params }: Params) {
  const perfume = getPerfumeById(params.id);
  if (!perfume) notFound();

  return (
    <main className="space-y-8 pt-4">
      <Link
        href="/result"
        className="text-xs text-neutral-500 underline-offset-4 hover:underline"
      >
        ← 結果に戻る
      </Link>

      <header className="space-y-2 border-b border-neutral-200 pb-6">
        <p className="text-xs text-neutral-500">{perfume.brand}</p>
        <h1 className="text-3xl font-light">{perfume.name}</h1>
        <p className="text-xs text-neutral-500">
          {perfume.scent_family} ／ {perfume.concentration} ／ 調香: {perfume.perfumer}
        </p>
        <p className="text-sm text-neutral-700">
          ¥{perfume.price_yen.toLocaleString()}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-neutral-500">情景</h2>
        <p className="text-base leading-relaxed text-neutral-800">
          {perfume.description}
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <NoteBlock title="トップノート" notes={perfume.top_notes} />
        <NoteBlock title="ミドルノート" notes={perfume.middle_notes} />
        <NoteBlock title="ベースノート" notes={perfume.base_notes} />
      </section>

      <section className="grid grid-cols-2 gap-4 rounded-md border border-neutral-200 p-5 text-sm">
        <Meta title="香り立ち" value={renderBar(perfume.intensity)} />
        <Meta title="持続力" value={renderBar(perfume.longevity)} />
        <Meta title="相性シーン" value={perfume.scene_tags.join(" / ")} />
        <Meta title="相性シーズン" value={perfume.season_tags.join(" / ")} />
      </section>
    </main>
  );
}

function NoteBlock({ title, notes }: { title: string; notes: string[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs text-neutral-500">{title}</h3>
      <ul className="space-y-1 text-sm text-neutral-800">
        {notes.map((n) => (
          <li key={n}>・{n}</li>
        ))}
      </ul>
    </div>
  );
}

function Meta({ title, value }: { title: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-neutral-500">{title}</p>
      <p className="text-sm text-neutral-800">{value}</p>
    </div>
  );
}

function renderBar(v: number): string {
  return "●".repeat(v) + "○".repeat(Math.max(0, 5 - v));
}
