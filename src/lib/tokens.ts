

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

export const generatePasswordResetToken = async (email: string) => {
  const { v4: uuidv4 } = require("uuid");
  const token = uuidv4();
  // Token expires in 1 hour
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await prisma.passwordResetToken.findFirst({
    where: { email },
  });

  if (existingToken) {
    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id },
    });
  }

  const passwordResetToken = await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
};
