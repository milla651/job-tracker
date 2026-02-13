
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

const resend = new Resend(apiKey);

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const sendVerificationEmail = async (email: string, token: string) => {
  if (!apiKey) {
    console.log("-----------------------------------------");
    console.log("⚠️ RESEND_API_KEY is missing in .env!");
    console.log(`Would have sent verification email to: ${email}`);
    console.log(`Token: ${token}`);
    console.log("-----------------------------------------");
    return { success: true }; // Treat as success for dev
  }

  const confirmLink = `${domain}/new-verification?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "JobTracker <onboarding@resend.dev>",
      to: email,
      subject: "Confirm your email",
      html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`,
    });

    if (error) {
      console.error("Resend error:", error);
      return { error: "Failed to send verification email" };
    }

    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { error: "Failed to send verification email" };
  }
};
