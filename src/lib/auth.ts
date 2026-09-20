import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import LinkedIn from "next-auth/providers/linkedin"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

const isDev = process.env.NODE_ENV === "development"
const hasLinkedInKeys = process.env.LINKEDIN_CLIENT_ID && 
  process.env.LINKEDIN_CLIENT_ID !== "test-linkedin-client-id" &&
  process.env.LINKEDIN_CLIENT_SECRET &&
  process.env.LINKEDIN_CLIENT_SECRET !== "test-linkedin-client-secret"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    ...(hasLinkedInKeys ? [LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "r_liteprofile r_emailaddress w_member_social",
        },
      },
    })] : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.profilePhoto,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      if (account?.provider === "linkedin") {
        token.linkedinToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider !== "credentials") {
        // Allow OAuth providers - PrismaAdapter will create user
        return true
      }

      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
      })

      if (!dbUser || dbUser.status === 0) return false
      return true
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      if (isNewUser && account?.provider !== "credentials") {
        console.log("[AUTH] New OAuth user created:", { email: user.email, provider: account?.provider })
        // Welcome email will be sent via server action
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
})