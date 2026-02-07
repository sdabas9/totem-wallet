import { Session, Chains } from '@wharfkit/session';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import { TransactPluginResourceProvider } from '@wharfkit/transact-plugin-resource-provider';
import { TransactPluginAutoCorrect } from '@wharfkit/transact-plugin-autocorrect';
import { saveSession, clearSession } from './store';

let currentSession: Session | null = null;
let currentChainId: string = '';

export const SUPPORTED_CHAINS: Record<string, { chain: typeof Chains.Jungle4; label: string }> = {
  jungle4: { chain: Chains.Jungle4, label: 'Jungle4 Testnet' },
  eos: { chain: Chains.EOS, label: 'EOS Mainnet' },
};

export function createSession(
  privateKey: string,
  accountName: string,
  chainId: string
): Session {
  const chainConfig = SUPPORTED_CHAINS[chainId];
  if (!chainConfig) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }

  const session = new Session({
    chain: chainConfig.chain,
    walletPlugin: new WalletPluginPrivateKey(privateKey),
    transactPlugins: [
      new TransactPluginResourceProvider(),
      new TransactPluginAutoCorrect(),
    ],
    actor: accountName,
    permission: 'active',
  });

  currentSession = session;
  currentChainId = chainId;
  saveSession(privateKey, accountName, chainId);

  return session;
}

export function getSession(): Session | null {
  return currentSession;
}

export function getSessionInfo(): { accountName: string; chainId: string; chainLabel: string } | null {
  if (!currentSession) return null;
  return {
    accountName: currentSession.actor.toString(),
    chainId: currentChainId,
    chainLabel: SUPPORTED_CHAINS[currentChainId]?.label || currentChainId,
  };
}

export function lockSession(): void {
  currentSession = null;
  currentChainId = '';
}

export function destroySession(): void {
  currentSession = null;
  currentChainId = '';
  clearSession();
}
