import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("cv") as File | null;

  if (!file || file.type !== "application/pdf") {
    return NextResponse.json({ error: "PDF file required" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Dynamically import pdf-parse to avoid edge runtime issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);

  const text = (data.text as string).trim();

  if (text.length < 100) {
    return NextResponse.json(
      { error: "Could not extract text from PDF. Try a text-based PDF (not a scanned image)." },
      { status: 422 }
    );
  }

  return NextResponse.json({ text });
}
