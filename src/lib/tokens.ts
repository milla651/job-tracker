

import { prisma } from "@/lib/prisma";

export const generateVerificationToken = async (email: string) => {
  // Generate a random 6-digit number
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  // Token expires in 1 hour
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { email },
  });

  const verificationToken = await prisma.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return verificationToken;
};
