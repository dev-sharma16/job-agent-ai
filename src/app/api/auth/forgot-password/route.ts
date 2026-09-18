import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendEmail, resetPasswordEmailTemplate } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    // Uniform response (don't reveal if email exists)
    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      // Rate limit: max 3 resets per day
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const recentResets = await prisma.passwordReset.count({
        where: {
          userId: user.id,
          createdAt: { gte: todayStart },
        },
      })

      if (recentResets < 3) {
        const token = "RJ" + crypto.randomBytes(16).toString("hex")
        const expiresAt = new Date(Date.now() + 3600000) // 1 hour

        await prisma.passwordReset.create({
          data: { userId: user.id, token, expiresAt },
        })

        await sendEmail({
          to: user.email,
          subject: "Reset your JobaajOne password",
          html: resetPasswordEmailTemplate(user.name, token),
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}