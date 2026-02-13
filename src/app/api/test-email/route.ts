
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/mail";

export async function GET() {
  try {
    const result = await sendVerificationEmail("benkim388@gmail.com", "test-token");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to send email", details: error }, { status: 500 });
  }
}
