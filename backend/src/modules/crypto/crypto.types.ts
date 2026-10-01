export interface AfcTokenConfig {
  chainId: number; // 8453 for Base Mainnet, 84532 for Base Sepolia
  chainName: string;
  contractAddress: string;
  tokenSymbol: string;
  tokenName: string;
  decimals: number;
  rpcUrl: string;
  explorerUrl: string;
}

export interface UserWalletInfo {
  userId: string;
  onChainAddress: string | null;
  walletType: 'embedded_mpc' | 'smart_contract_account' | 'external_eoa';
  baseSepoliaBalanceAfc: string;
  embeddedWalletProvider: 'privy' | 'biconomy' | 'metamask';
  isGaslessSponsored: boolean;
}

export interface UserOperationV06 {
  sender: string;
  nonce: string;
  initCode: string;
  callData: string;
  callGasLimit: string;
  verificationGasLimit: string;
  preVerificationGas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  paymasterAndData: string;
  signature: string;
}
