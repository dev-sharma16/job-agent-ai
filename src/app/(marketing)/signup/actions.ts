"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendEmail, welcomeEmailTemplate } from "@/lib/email"
import { redirect } from "next/navigation"

export async function signup(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "All fields are required" }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: "Email already registered" }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      functionArea: {
        connectOrCreate: {
          where: { name: "Other" },
          create: { name: "Other" },
        },
      },
    },
  })

  await prisma.userCoins.create({
    data: { userId: user.id, coins: 0 },
  })

  await prisma.userStreak.create({
    data: { userId: user.id, currentStreak: 0, maxStreak: 0 },
  })

  await sendEmail({
    to: email,
    subject: `Hey ${name} - Welcome to JobaajOne!`,
    html: welcomeEmailTemplate(name),
  })

  redirect("/dashboard")
}