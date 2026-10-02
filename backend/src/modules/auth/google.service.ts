import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env';

export interface GoogleUserProfile {
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET
    );
  }

  async verifyIdToken(idToken: string): Promise<GoogleUserProfile> {
    // Development and test sandbox mode for testing if client ID is mock or token begins with mock_
    if (
      (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') &&
      (idToken.startsWith('mock_') || env.GOOGLE_CLIENT_ID?.startsWith('mock'))
    ) {
      const mockId = idToken.replace('mock_', '') || 'dev_google_user';
      return {
        googleId: `google_${mockId}`,
        email: `${mockId}@example.com`,
        displayName: `Google Player (${mockId})`,
        avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
      };
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        throw new Error('Google token payload missing user identifier or email');
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        displayName: payload.name || payload.email.split('@')[0],
        avatarUrl: payload.picture,
      };
    } catch (err: any) {
      if (env.NODE_ENV === 'development') {
        // Fallback for development if token verification fails
        console.warn('Google verifyIdToken failed, using dev mock user fallback:', err.message);
        return {
          googleId: 'mock_google_id_' + Buffer.from(idToken.slice(0, 10)).toString('hex'),
          email: 'google.dev@example.com',
          displayName: 'Google Dev Player',
          avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
        };
      }
      throw new Error(`Google token verification failed: ${err.message}`);
    }
  }

  async exchangeCode(code: string, redirectUri?: string): Promise<GoogleUserProfile> {
    if (env.NODE_ENV === 'development' && code.startsWith('mock_')) {
      return this.verifyIdToken(code);
    }

    const { tokens } = await this.client.getToken({
      code,
      redirect_uri: redirectUri || env.FRONTEND_URL,
    });

    if (!tokens.id_token) {
      throw new Error('Google OAuth exchange did not return an id_token');
    }

    return this.verifyIdToken(tokens.id_token);
  }
}

export const googleAuthService = new GoogleAuthService();
