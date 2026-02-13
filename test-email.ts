
import { sendVerificationEmail } from "@/lib/mail";

async function main() {
  console.log("Testing email sending...");
  try {
    const result = await sendVerificationEmail("onboarding@resend.dev", "test-token");
    console.log("Result:", result);
  } catch (error) {
    console.error("Caught error:", error);
  }
}

main();
