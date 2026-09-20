import { Resend } from "resend"

const isDev = process.env.NODE_ENV === "development"
const hasValidResendKey = process.env.RESEND_API_KEY && 
  process.env.RESEND_API_KEY !== "re_test_xxx" &&
  process.env.RESEND_API_KEY.startsWith("re_")

const resend = hasValidResendKey ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!resend) {
    if (isDev) {
      console.log("[DEV] Email skipped (no valid Resend key):", { to, subject })
      return { id: "dev-mock-id" }
    }
    throw new Error("Email service not configured")
  }
  
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  })
}

export function welcomeEmailTemplate(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to autoJob! 🎉</h1>
      </div>
      <div style="background: #f9fafb; padding: 40px 20px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hey <strong>${name}</strong>,</p>
        <p style="margin-bottom: 20px;">Thanks for joining autoJob! We're excited to help you power your career with our AI-driven tools.</p>
        <div style="background: white; padding: 24px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #667eea;">
          <h3 style="margin-top: 0; color: #667eea;">What you can do now:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Build ATS-optimized resumes with AI</li>
            <li>Track job applications on a Kanban board</li>
            <li>Practice mock interviews with AI feedback</li>
            <li>Optimize your LinkedIn profile</li>
            <li>Earn coins and unlock premium features</li>
          </ul>
        </div>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Go to Dashboard</a>
        <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">If you have any questions, just reply to this email. We're here to help!</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">© ${new Date().getFullYear()} autoJob. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
}

export function resetPasswordEmailTemplate(name: string, token: string): string {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
      </div>
      <div style="background: #f9fafb; padding: 40px 20px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hey <strong>${name}</strong>,</p>
        <p style="margin-bottom: 20px;">You requested to reset your password. Click the button below to create a new one:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">© ${new Date().getFullYear()} autoJob. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
}

export function membershipEmailTemplate(name: string, planName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to autoJob Pro! ✨</h1>
      </div>
      <div style="background: #f9fafb; padding: 40px 20px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Hey <strong>${name}</strong>,</p>
        <p style="margin-bottom: 20px;">Your <strong>${planName}</strong> subscription is now active! 🎉</p>
        <div style="background: white; padding: 24px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #f59e0b;">Your Pro Benefits:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Unlimited AI resume generations</li>
            <li>Unlimited mock interviews</li>
            <li>Full LinkedIn profile optimization</li>
            <li>Advanced job tracker filters</li>
            <li>Premium resume templates</li>
            <li>Priority support</li>
          </ul>
        </div>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Explore Pro Features</a>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">© ${new Date().getFullYear()} autoJob. All rights reserved.</p>
      </div>
    </body>
    </html>
  `
}