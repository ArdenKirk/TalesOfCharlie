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
    async signIn(params: any) {
      const { user, account, profile } = params
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
    async jwt(params: any) {
      const { token, user, account } = params
      // Store user info in JWT token
      if (user) {
        token.id = (user as any).id
        token.username = (user as any).username
        token.email = user.email
        token.image = user.image
      }
      return token
    },
    async session(params: any) {
      const { session, token } = params
      // Send properties to the client
      if (token) {
        ;(session.user as any).id = token.id as string
        ;(session.user as any).username = token.username as string
        ;(session.user as any).email = token.email as string
        ;(session.user as any).image = token.image as string
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
