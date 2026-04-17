import { NextResponse } from "next/server";
import { readData, writeData } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const data = await readData();

  if (Array.isArray(body.monthlyTop)) data.monthlyTop = body.monthlyTop.slice(0, 3);
  if (Array.isArray(body.yearlyTop)) data.yearlyTop = body.yearlyTop;

  // validate all IDs exist in brokers
  const valid = new Set(data.brokers.map((b) => b.id));
  data.monthlyTop = data.monthlyTop.filter((id) => valid.has(id));
  data.yearlyTop = data.yearlyTop.filter((id) => valid.has(id));

  await writeData(data);
  return NextResponse.json({ ok: true, data });
}
