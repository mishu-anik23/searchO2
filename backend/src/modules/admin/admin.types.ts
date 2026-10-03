export type UserAccountStatus = 'active' | 'suspended' | 'banned';

export interface AdminUserSummary {
  id: string;
  email: string | null;
  displayName: string;
  role: 'guest' | 'user' | 'admin';
  status: UserAccountStatus;
  emailVerified: boolean;
  authProvider: 'local' | 'google' | 'guest';
  createdAt: string;
  lastLoginAt: string;
  primaryFarmId?: string;
  money?: number;
  totalO2?: number;
  activeSessionsCount?: number;
}

export interface UserSessionRecord {
  id: string;
  userId: string;
  ipAddress: string;
  geoLocation: {
    country: string;
    countryCode: string;
    city: string;
    region?: string;
  };
  deviceType: string;
  browser: string;
  os: string;
  userAgent: string;
  isRevoked: boolean;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
}

export interface AdminUserDetails {
  personal: {
    id: string;
    email: string | null;
    displayName: string;
    role: 'guest' | 'user' | 'admin';
    status: UserAccountStatus;
    emailVerified: boolean;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
  };
  locationAndDevice: {
    recentIpAddresses: string[];
    primaryGeoLocation: {
      country: string;
      countryCode: string;
      city: string;
      region?: string;
    };
    deviceBreakdown: {
      deviceType: string;
      browser: string;
      os: string;
      userAgent: string;
      lastActive: string;
    }[];
  };
  gameData: {
    farms: Array<{
      id: string;
      name: string;
      regionCode: string;
      money: number;
      totalO2: number;
      totalO2AllTime: number;
      treesPlanted: number;
      farmReputation: number;
      demerits: number;
      storageState: any;
      buildingsState: any;
      plotsCount: number;
      plots: Array<{
        plotIndex: number;
        status: string;
        treeType: string | null;
        health: number;
        growHours: number;
      }>;
      createdAt: string;
      updatedAt: string;
    }>;
    totalMoneySum: number;
    totalO2Sum: number;
    totalPlotsCount: number;
  };
  accountData: {
    authProvider: 'local' | 'google' | 'guest';
    googleId: string | null;
    wallets: Array<{
      id: string;
      game: string;
      asset: string;
      balanceUnits: string;
      onChainAddress: string | null;
    }>;
    recentLedgerEntries: Array<{
      id: string;
      amount: string;
      balanceAfter: string;
      transactionType: string;
      sourceGame: string;
      referenceType: string | null;
      createdAt: string;
    }>;
  };
  sessionsAndCookies: {
    activeSessions: UserSessionRecord[];
    cookieSecurityPolicy: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: string;
      cookieName: string;
      maxAgeDays: number;
    };
  };
}

export interface AdminAuditLogEntry {
  id: string;
  adminUserId: string;
  adminEmail?: string;
  adminDisplayName?: string;
  targetUserId: string | null;
  targetDisplayName?: string;
  action: string;
  reason: string;
  ticketRef?: string;
  details?: any;
  ipAddress: string;
  createdAt: string;
}

export interface AdminSystemStats {
  totalUsers: number;
  totalGuests: number;
  totalRegistered: number;
  totalAdmins: number;
  activeSessionsCount: number;
  totalFarmsCount: number;
  totalEconomyMoneySum: number;
  totalO2ProducedSum: number;
  serverTimestamp: string;
}
