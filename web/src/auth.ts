import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Precomputed cost-12 bcrypt hash to equalize timing when user/passwordHash is missing (timing oracle mitigation).
export const DUMMY_HASH = '$2b$12$Vj055DJd5MtHBKpCBoLFHOAF6xZigU6QlzEdRo0g9qz22pY4Q11GO';

const prisma = new PrismaClient();

// Rate limiting: 5 requests per minute, sliding window
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
});

export async function verifyUserCredentials(
  email: unknown,
  password: unknown,
  ip: string = '127.0.0.1',
  deps = {
    findUser: (e: string) => prisma.user.findUnique({ where: { email: e } }),
    limit: (key: string) => ratelimit.limit(key),
    compare: bcrypt.compare,
    dummyHash: DUMMY_HASH,
  }
) {
  if (!email || !password) return null;
  const key = `${email}:${ip}`;

  try {
    const { success } = await deps.limit(key);
    if (!success) return null;
  } catch (error) {
    // FAIL-CLOSED on Redis error (deny, never allow)
    console.error('Rate limit error:', error);
    return null;
  }

  const user = await deps.findUser(email.toString().toLowerCase());

  if (!user || !user.passwordHash) {
    // Timing oracle mitigation: perform dummy compare to match password-hash execution time
    await deps.compare(password.toString(), deps.dummyHash);
    return null;
  }

  const isValid = await deps.compare(password.toString(), user.passwordHash);

  if (!isValid) return null;

  return user;
}

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
        const ip = req?.headers?.get('x-forwarded-for') ?? '127.0.0.1';
        return verifyUserCredentials(credentials?.email, credentials?.password, ip);
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
