import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { NextAuthConfig } from "next-auth"

const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Verify with our API that this user is allowed
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/google/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,
              googleId: account.providerAccountId,
              name: user.name,
              avatarUrl: user.image,
            }),
          })

          if (response.ok) {
            const userData = await response.json()
            // Store additional user data
            ;(user as any).id = userData.user.id
            ;(user as any).username = userData.user.username
            return true
          }
          return false
        } catch (error) {
          console.error("Error verifying user:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      // Store user info in JWT token
      if (user) {
        ;(token as any).id = (user as any).id
        ;(token as any).username = (user as any).username
        ;(token as any).email = user.email
        ;(token as any).image = user.image
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        ;(session.user as any).id = (token as any).id
        ;(session.user as any).username = (token as any).username
        ;(session.user as any).email = (token as any).email
        ;(session.user as any).image = (token as any).image
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
