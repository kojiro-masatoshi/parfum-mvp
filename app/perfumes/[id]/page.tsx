import { notFound } from "next/navigation";
import Link from "next/link";
import { getPerfumeById } from "@/lib/db";
import { meshGradientFor, themeOf } from "@/lib/scent-theme";

interface Params {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export default function PerfumeDetailPage({ params }: Params) {
  const perfume = getPerfumeById(params.id);
  if (!perfume) notFound();

  const theme = themeOf(perfume.scent_family);

  return (
    <div className="space-y-14 fade-up">
      <Link
        href="/result"
        className="font-garamond text-[11px] tracking-[0.3em] text-neutral-500 underline-offset-4 hover:underline"
      >
        ← BACK TO SELECTION
      </Link>

      <section
        className="relative w-screen overflow-hidden ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: meshGradientFor(theme, perfume.id),
            filter: "blur(40px)",
            transform: "scale(1.15)",
            opacity: 0.85,
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{
            background:
              "linear-gradient(180deg, var(--background) 0%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, var(--background) 100%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center sm:py-28">
          <p
            className="font-garamond text-[11px] tracking-[0.5em]"
            style={{ color: theme.accent }}
          >
            {theme.label.toUpperCase()}
          </p>
          <p className="mt-4 font-garamond text-[10px] tracking-[0.4em] text-neutral-500">
            {perfume.brand.toUpperCase()}
          </p>
          <h1 className="mt-3 font-mincho text-3xl font-light leading-[1.4] sm:text-4xl">
            {perfume.name}
          </h1>
          <div
            className="mx-auto mt-6 h-px w-10"
            style={{ background: theme.accent }}
          />
          <p className="mt-6 font-mincho text-sm italic leading-[2] text-neutral-600">
            — {theme.poem}
          </p>
        </div>
      </section>

      <section className="space-y-4 text-center">
        <p className="font-garamond text-[10px] tracking-[0.4em] text-neutral-400">
          SCENE
        </p>
        <p className="mx-auto max-w-md font-mincho text-base leading-[2.1] text-neutral-800">
          {perfume.description}
        </p>
      </section>

      <section className="space-y-6">
        <div className="text-center">
          <p className="font-garamond text-[10px] tracking-[0.4em] text-neutral-400">
            NOTES
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <NoteBlock title="Top" subtitle="トップ" notes={perfume.top_notes} accent={theme.accent} />
          <NoteBlock title="Heart" subtitle="ミドル" notes={perfume.middle_notes} accent={theme.accent} />
          <NoteBlock title="Base" subtitle="ベース" notes={perfume.base_notes} accent={theme.accent} />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-y-6 gap-x-10 pt-2 text-sm sm:grid-cols-4">
        <Meta label="CONCENTRATION" value={perfume.concentration} />
        <Meta label="PERFUMER" value={perfume.perfumer} />
        <Meta label="SILLAGE" value={renderBar(perfume.intensity, theme.accent)} html />
        <Meta label="LONGEVITY" value={renderBar(perfume.longevity, theme.accent)} html />
        <Meta label="SCENE" value={perfume.scene_tags.join(" / ")} />
        <Meta label="SEASON" value={perfume.season_tags.join(" / ")} />
        <Meta label="PRICE" value={`¥${perfume.price_yen.toLocaleString()}`} />
        <Meta label="FAMILY" value={perfume.scent_family} />
      </section>
    </div>
  );
}

function NoteBlock({
  title,
  subtitle,
  notes,
  accent,
}: {
  title: string;
  subtitle: string;
  notes: string[];
  accent: string;
}) {
  return (
    <div className="space-y-3 border-t pt-4" style={{ borderColor: accent }}>
      <div>
        <p
          className="font-garamond text-[10px] tracking-[0.4em]"
          style={{ color: accent }}
        >
          {title.toUpperCase()}
        </p>
        <p className="font-mincho text-xs text-neutral-400">{subtitle}</p>
      </div>
      <ul className="space-y-1 font-mincho text-sm text-neutral-800">
        {notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

function Meta({
  label,
  value,
  html,
}: {
  label: string;
  value: string;
  html?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="font-garamond text-[9px] tracking-[0.4em] text-neutral-400">
        {label}
      </p>
      {html ? (
        <p
          className="text-neutral-800"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <p className="font-mincho text-sm text-neutral-800">{value}</p>
      )}
    </div>
  );
}

function renderBar(v: number, color: string): string {
  const filled = Array.from({ length: v })
    .map(
      () =>
        `<span style="display:inline-block;width:14px;height:2px;background:${color};margin-right:4px;vertical-align:middle"></span>`,
    )
    .join("");
  const empty = Array.from({ length: Math.max(0, 5 - v) })
    .map(
      () =>
        `<span style="display:inline-block;width:14px;height:2px;background:#ddd;margin-right:4px;vertical-align:middle"></span>`,
    )
    .join("");
  return filled + empty;
}
