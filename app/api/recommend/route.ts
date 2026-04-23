import { NextResponse } from "next/server";
import { getAllPerfumes, saveDiagnosisResult } from "@/lib/db";
import { recommend } from "@/lib/recommend";
import type { DiagnosisAnswers } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const answers = body as DiagnosisAnswers;
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const perfumes = getAllPerfumes();
  const result = recommend(perfumes, answers, 5);

  saveDiagnosisResult(
    JSON.stringify(answers),
    result.map((r) => r.perfume.id),
  );

  return NextResponse.json({ recommendations: result });
}
