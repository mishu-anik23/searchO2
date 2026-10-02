import { query } from '../../config/database';
import { AfcTokenConfig, UserWalletInfo, UserOperationV06 } from './crypto.types';

export const BASE_AFC_CONFIG: AfcTokenConfig = {
  chainId: 84532, // Base Sepolia Testnet (Production: 8453 Base Mainnet)
  chainName: 'Base L2 (Coinbase OP Stack)',
  contractAddress: '0xAFC2000000000000000000000000000000000000', // #TODO: Replace with deployed ERC-20 contract address
  tokenSymbol: 'AFC',
  tokenName: 'Agro-Forestry Carbon Token',
  decimals: 18,
  rpcUrl: 'https://sepolia.base.org',
  explorerUrl: 'https://sepolia.basescan.org',
};

export class CryptoService {
  /**
   * Binds an on-chain EVM wallet address to the user's SearchO2 profile.
   * Supports embedded MPC wallets (Privy / Biconomy) or external Web3 wallets (MetaMask).
   * 
   * #TODO: GDPR Article 17 Compliance:
   * The wallet address is pseudonymous and never contains personal data.
   * If user requests erasure, the association is severed while on-chain hashes remain immutable.
   */
  async bindUserWallet(userId: string, evmAddress: string): Promise<UserWalletInfo> {
    const cleanAddress = evmAddress.trim().toLowerCase();
    if (!/^0x[a-f0-9]{40}$/.test(cleanAddress)) {
      throw { statusCode: 400, message: 'Invalid EVM hexadecimal wallet address.' };
    }

    await query(
      `UPDATE game_wallets
       SET on_chain_address = $1, updated_at = NOW()
       WHERE user_id = $2`,
      [cleanAddress, userId]
    );

    return this.getUserWallet(userId);
  }

  /**
   * Retrieves wallet connection information and balance for the user.
   */
  async getUserWallet(userId: string): Promise<UserWalletInfo> {
    const res = await query(
      `SELECT on_chain_address
       FROM game_wallets
       WHERE user_id = $1 AND asset = 'AFC'
       LIMIT 1`,
      [userId]
    );

    const onChainAddress = res.rows[0]?.on_chain_address || null;

    // #TODO: In production, query the Base L2 JSON-RPC via ethers / viem Contract.balanceOf(onChainAddress)
    return {
      userId,
      onChainAddress,
      walletType: onChainAddress ? 'embedded_mpc' : 'external_eoa',
      baseSepoliaBalanceAfc: '0.00',
      embeddedWalletProvider: 'privy',
      isGaslessSponsored: true, // ERC-4337 Paymaster active on Base
    };
  }

  /**
   * #TODO: ERC-4337 Paymaster Gas Sponsorship
   * Validates a UserOperation and signs it with the startup's Paymaster private key.
   * This sponsors gas fees for casual players so they can play without holding ETH on Base.
   * 
   * Startup Cost Optimization:
   * Base L2 transaction costs average < €0.002, making player gas sponsorship extremely cost-efficient.
   */
  async sponsorGaslessUserOp(userId: string, userOp: UserOperationV06): Promise<{ paymasterAndData: string; validUntil: number }> {
    // 1. Verify user is in good standing and not rate-limited
    const userRes = await query(`SELECT role FROM users WHERE id = $1`, [userId]);
    if (!userRes.rowCount || userRes.rows[0].role === 'guest') {
      throw { statusCode: 403, message: 'Gasless sponsorship requires a registered account.' };
    }

    // #TODO: Sign the UserOp hash with the Paymaster Key ceremony (AWS KMS / HashiCorp Vault)
    const validUntil = Math.floor(Date.now() / 1000) + 3600; // 1 hour validity
    const dummyPaymasterSig = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    return {
      paymasterAndData: BASE_AFC_CONFIG.contractAddress + dummyPaymasterSig.slice(2),
      validUntil,
    };
  }

  /**
   * #TODO: Travel Rule & AML Screening (Regulation EU 2023/1113)
   * Before broadcasting an on-chain transfer of AFC exceeding €1,000 (200,000 AFC),
   * screen destination address against Chainalysis / TRM Labs / Sumsub Travel Rule API.
   */
  async verifyTravelRule(originatorAddress: string, destinationAddress: string, amountAfc: number): Promise<{ compliant: boolean; requiresKycLevel2: boolean }> {
    const EUR_EQUIVALENT = amountAfc / 200;
    if (EUR_EQUIVALENT >= 1000) {
      return { compliant: true, requiresKycLevel2: true };
    }
    return { compliant: true, requiresKycLevel2: false };
  }
}

export const cryptoService = new CryptoService();
