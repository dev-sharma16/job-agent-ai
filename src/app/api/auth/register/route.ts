import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendEmail, welcomeEmailTemplate } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
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

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}