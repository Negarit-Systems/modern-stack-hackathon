import { initFirecrawl } from "@/lib/firecrawl";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { url } = await req.json();
  const firecrawl = initFirecrawl();
  const result = await firecrawl.scrape(url);
  return NextResponse.json(result);
}
