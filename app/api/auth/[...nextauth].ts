import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import MicrosoftProvider from "next-auth/providers/microsoft";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    MicrosoftProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID as string,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
    }),
    // ...add more providers here
  ],
}

export default NextAuth(authOptions)