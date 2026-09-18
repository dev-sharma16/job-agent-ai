import Razorpay from "razorpay"

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export const PLANS = {
  monthly: { id: 1, amount: 49900, name: "Monthly Pro" },
  quarterly: { id: 2, amount: 129900, name: "Quarterly Pro" },
  yearly: { id: 3, amount: 399900, name: "Yearly Pro" },
} as const

export const COIN_REDEMPTION = {
  coinsRequired: 990,
  planId: 4,
} as const