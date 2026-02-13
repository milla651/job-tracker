
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/mail";

export async function GET() {
  try {
    const result = await sendVerificationEmail("onboarding@resend.dev", "test-token");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to send email", details: error }, { status: 500 });
  }
}
