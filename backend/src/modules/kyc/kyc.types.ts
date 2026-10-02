export interface KycCaseSummary {
  userId: string;
  provider: 'sumsub' | 'veriff';
  applicantId: string;
  status: 'init' | 'pending' | 'approved' | 'rejected' | 'requires_action';
  verificationLevel: string;
  pepSanctionsCleared: boolean;
  idCountryCode?: string | null;
  rejectionReason?: string | null;
  updatedAt: string;
}

export interface SumsubApplicantTokenResult {
  applicantId: string;
  accessToken: string;
  webSdkUrl: string;
  expiresAt: string;
}
