// Auth disabled
export const authConfig = {
  pages: {
    signIn: '/',
  },
  callbacks: {
    authorized: () => true,
  },
  secret: 'dummy-secret-for-disabled-auth',
  providers: []
};
