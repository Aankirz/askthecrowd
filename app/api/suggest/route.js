import { NextResponse } from "next/server";
import { getResults } from "../../../lib/pipeline.js";
import { rateLimit } from "../../../lib/cache.js";

// JSON API for programmatic / OSS use: GET /api/suggest?q=keyword
export async function GET(req) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ error: "missing ?q" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(ip)) return NextResponse.json({ error: "rate limited" }, { status: 429 });

  return NextResponse.json(await getResults(q));
}
