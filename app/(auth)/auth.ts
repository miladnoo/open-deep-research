// Auth disabled
import { NextResponse } from 'next/server';

export const auth = async () => null;
export const signIn = async () => NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
export const signOut = async () => NextResponse.redirect(new URL('/', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
export const handlers = {
  GET: () => new Response(null),
  POST: () => new Response(null)
};
