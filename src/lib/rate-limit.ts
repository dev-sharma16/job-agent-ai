import { prisma } from "./prisma"

export async function checkRateLimit(
  bucket: string,
  identifier: string,
  limit: number,
  windowMs: number,
  blockMs: number
): Promise<boolean> {
  const key = `${bucket}:${identifier}`
  const now = Date.now()
  const windowStart = now - windowMs

  try {
    const rateLimit = await prisma.rateLimit.findUnique({
      where: { bucket: key },
    })

    if (!rateLimit) {
      await prisma.rateLimit.create({
        data: {
          bucket: key,
          hits: 1,
          windowStart: now,
          blockedUntil: 0,
        },
      })
      return true
    }

    if (rateLimit.blockedUntil > now) {
      return false
    }

    if (rateLimit.windowStart < windowStart) {
      await prisma.rateLimit.update({
        where: { bucket: key },
        data: {
          hits: 1,
          windowStart: now,
        },
      })
      return true
    }

    if (rateLimit.hits >= limit) {
      await prisma.rateLimit.update({
        where: { bucket: key },
        data: {
          blockedUntil: now + blockMs,
        },
      })
      return false
    }

    await prisma.rateLimit.update({
      where: { bucket: key },
      data: {
        hits: { increment: 1 },
      },
    })
    return true
  } catch {
    return true
  }
}