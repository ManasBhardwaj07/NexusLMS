import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const prisma = new PrismaClient();

// Rate limiting: 5 requests per minute, sliding window
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // Extract IP from headers or fallback
        const ip = req?.headers?.get('x-forwarded-for') ?? '127.0.0.1';
        const key = `${credentials.email}:${ip}`;

        try {
          const { success } = await ratelimit.limit(key);
          if (!success) return null;
        } catch (error) {
          // FAIL-CLOSED on Redis error (deny, never allow)
          console.error('Rate limit error:', error);
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toString().toLowerCase() }
        });
        
        if (!user || !user.passwordHash) return null;
        
        const isValid = await bcrypt.compare(credentials.password.toString(), user.passwordHash);
        
        if (!isValid) return null;
        
        return user;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;
        const existingUser = await prisma.user.findUnique({
           where: { email: user.email }
        });
        // DPDPA Collision rule: Google matches existing -> Deny with clear URL error. No silent merge.
        if (existingUser) {
           const linkedAccount = await prisma.account.findFirst({
             where: { userId: existingUser.id, provider: 'google' }
           });
           if (!linkedAccount) {
             return false;
           }
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = ('role' in user ? user.role : 'STUDENT');
        token.tv = ('tokenVersion' in user ? user.tokenVersion : 0);
      }
      return token;
    },
    async session({ session, token }) {
      if (token.uid) {
        session.user.id = token.uid as string;
        // Extend session.user dynamically without any
        Object.assign(session.user, {
          role: token.role as string,
          tv: token.tv as number
        });
      }
      return session;
    }
  }
});
