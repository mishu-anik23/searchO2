export type UserRole = 'guest' | 'user' | 'admin';
export type AuthProvider = 'local' | 'google' | 'guest';

export interface AuthUserPayload {
  userId: string;
  role: UserRole;
  authProvider: AuthProvider;
  farmId: string;
  isGuest: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}
