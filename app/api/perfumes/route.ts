import { NextResponse } from "next/server";
import { getAllPerfumes } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const perfumes = getAllPerfumes();
  return NextResponse.json({ perfumes });
}
