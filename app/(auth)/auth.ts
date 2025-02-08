// Auth disabled
import { NextResponse } from 'next/server';

interface AuthUser {
  id: string;
}

interface AuthSession {
  user: AuthUser | null;
}

export const auth = async (): Promise<AuthSession> => ({
  user: {
    id: 'anonymous-user'
  }
});
export const signIn = async () => NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
export const signOut = async () => NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
export const handlers = {
  GET: () => new Response(null),
  POST: () => new Response(null)
};
