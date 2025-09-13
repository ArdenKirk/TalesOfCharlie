import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      email: string
      image?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    username: string
    email: string
    image?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    email: string
    image?: string
  }
}
