import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_ENTRA_ID_CLIENT_ID,
      clientSecret: process.env.AUTH_ENTRA_ID_CLIENT_SECRET,
      // We must use 'issuer' to define the tenant in Auth.js v5
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_ENTRA_ID_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          // Injected dynamically from your environment
          scope: process.env.AUTH_ENTRA_ID_API_SCOPE,
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, account }) {
      // Extract the ACCESS TOKEN when the user logs in
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // Inject the access token into the session payload
      if (token?.accessToken) {
        // @ts-expect-error - NextAuth types don't natively include accessToken in Session
        session.accessToken = token.accessToken
      }
      return session
    }
  }
})