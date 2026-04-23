import { NextResponse } from "next/server";
import { getPerfumeById } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const perfume = getPerfumeById(params.id);
  if (!perfume) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ perfume });
}
