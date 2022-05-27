import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import spotifyApi, { LOGIN_URL } from "../../../lib/spotify";

async function refreshAccessToken(token) {
  try {

    spotifyApi.setAccessToken(token.accessToken);
    spotifyApi.setRefreshToken(token.refreshToken);

    const { body: refreshedToken } = await spotifyApi.refreshAccessToken(); 
    console.log("REFRESHED TOKEN IS", refreshedToken);

    return {
      ...token,
      accessToken: refreshedToken.access_token,
      accesTokenExpires: Date.now + refreshedToken.expires_in * 1000, // = 1 hour as 3600 returns from the Spotify API
      refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
      // Replace if new one came back, else fall back to old refresh token
    }

  } catch (error) {
    console.error(error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      authorization: LOGIN_URL,
    }),
    // ...add more providers here
  ],
  secret: process.env.JWT_SECRET,
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, account, user }) {
      //initial signin
      if(account && user) {
        return {
          ...token,
          accesToken: account.access_token,
          refreshToken: account.refresh_token,
          username: account.providerAccountId,
          accesTokenExpires: account.expires_at * 1000, //we are handling expiry times in Milliseconds hence *1000
        }
      }

      //Return previous token if the access token has not expired yet
      if (Date.now() < token.accesTokenExpires) {
        return token;
      }

      //Access token expired, so we need to refresh it somehow..
      console.log("ACCES TOKEN HAS EXPIRED, REFRESHING...");
      return await refreshAccessToken(token)
    },

    async session({ session, token}) {
      session.user.accessToken = token.accesToken;
      session.user.refreshToken = token.refreshToken;
      session.user.username = token.username;

      return session;
    },
  },
});