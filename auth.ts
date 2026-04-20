import NextAuth, { CredentialsSignin, DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"; 
import { connectDB } from "./lib/mongoose";
import { User } from "./lib/models/User";
import { compare, hash } from "bcryptjs";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface User {
    role?: string;
    onboarded?: boolean;
    username?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      onboarded: boolean;
      username: string;
    } & DefaultSession["user"]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Credentials",
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" }
      },

      authorize: async (credentials) => {
        const emailOrUsername = (credentials.emailOrUsername as string | undefined)?.trim().toLowerCase();
        const password = (credentials.password as string | undefined)?.trim();

        if(!emailOrUsername || !password) {
          throw new CredentialsSignin("Credentials are required");
        }

        await connectDB();

        console.log(`[AUTH] Attempting login for: ${emailOrUsername}`);

        const user = await User.findOne({ 
          $or: [
            { email: emailOrUsername }, 
            { username: emailOrUsername }
          ] 
        }).select("+password +role");

        if (!user) {
          console.log(`[AUTH] User not found during login: ${emailOrUsername}`);
          throw new Error("Invalid credentials");
        }

        if (!user.password) {
          console.log(`[AUTH] User found but has NO password (OAuth user): ${emailOrUsername}`);
          throw new Error("Invalid credentials");
        }

        const isMatched = await compare(password, user.password);

        if (!isMatched) {
          console.log(`[AUTH] Password comparison failed for: ${emailOrUsername}`);
          throw new Error("Invalid credentials");
        }

        console.log(`[AUTH] Login success for: ${emailOrUsername}`);

        return {
          name: user.name,
          email: user.email,
          role: user.role,
          id: user._id.toString(), 
          onboarded: user.onboarded,
          image: user.image,
          username: user.username
        };
      }
    })
  ],

  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.onboarded = token.onboarded as boolean;
        session.user.username = token.username as string;
        session.user.image = token.picture as string;
      }
      return session;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.onboarded = user.onboarded;
        token.username = user.username;
        token.picture = user.image;
      }

      // 🔄 REAL-TIME SESSION UPDATE
      // When we call update() on the client, we update the token here
      if (trigger === "update" && session?.user) {
        token.onboarded = session.user.onboarded;
        token.name = session.user.name;
        token.username = session.user.username;
        token.picture = session.user.image;
      }

      return token;
    },

    signIn: async ({ user, account }) => {
      if (account?.provider === 'google') {
        try {
          const { email, name, image, id } = user;
          await connectDB();

          const alreadyUser = await User.findOne({ email });

          if (!alreadyUser) {
            const baseUsername = email?.split('@')[0] || "user";
            const uniqueUsername = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;

            await User.create({ 
                email, 
                name, 
                image, 
                authProviderId: id,
                username: uniqueUsername,
                onboarded: false 
            });
          }
          
          return true; 
        } catch (error) {
          console.error(error);
          throw new Error("Google sign in failed");
        }
      }

      return true;
    },
  },
});
