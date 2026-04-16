"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/mail";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    if (!name || !email || !password) {
      return { error: "All fields are required" };
    }

    if (password.length < 8) {
      return { error: "Password must be at least 8 characters" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: "Invalid email address" };
    }

    console.log("Checking for existing user...");
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    console.log("Hashing password...");
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating user in DB...");
    // Create user
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    console.log("Generating verification token...");
    const verificationToken = await generateVerificationToken(email);
    
    console.log("Sending email...");
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    console.log("Registration successful!");
    // Return the email so the client can redirect
    return { success: true, email };
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function verifyEmail(email: string, code: string) {
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: {
        email,
        token: code,
      },
    });

    if (!verificationToken) {
      return { error: "Invalid or expired code" };
    }

    if (verificationToken.attempts >= 3) {
      await db.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      return { error: "Too many failed attempts. Please request a new code." };
    }

    if (verificationToken.token !== code) {
      await db.verificationToken.update({
        where: { id: verificationToken.id },
        data: { attempts: { increment: 1 } },
      });
      return { error: `Invalid code. ${2 - verificationToken.attempts} attempts remaining.` };
    }

    const hasExpired = new Date(verificationToken.expires) < new Date();

    if (hasExpired) {
      return { error: "Code has expired" };
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return { error: "User does not exist" };
    }

    await db.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: new Date(),
        email: existingUser.email,
      },
    });

    // Auto-login user
    try {
      await signIn("credentials", {
        email,
        verificationToken: code,
        redirect: false,
      });
    } catch (err) {
      console.error("Auto-login failed:", err);
      // Determine if we should fail or just continue
      // If auto-login fails, user is still verified, just needs to login manually.
    }

    await db.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    // Send welcome email
    if (existingUser.name) {
      await sendWelcomeEmail(existingUser.email, existingUser.name);
    }

    return { success: true };
  } catch (error) {
    console.error("VERIFICATION ERROR:", error);
    return { error: "Something went wrong" };
  }
}

export async function resendVerificationCode(email: string) {
  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return { error: "User not found" };
    }

    if (existingUser.emailVerified) {
      return { error: "Email already verified" };
    }

    const existingToken = await db.verificationToken.findFirst({
      where: { email },
    });

    if (existingToken) {
      const now = new Date();
      const lastAttempt = new Date(existingToken.lastAttempt);
      const difference = now.getTime() - lastAttempt.getTime();

      // Rate limit: 1 minute
      if (difference < 60000) {
        return { error: "Please wait 1 minute before requesting a new code" };
      }
    }

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    return { success: true };
  } catch (error) {
    console.error("RESEND ERROR:", error);
    return { error: "Failed to resend code" };
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/" });
}
