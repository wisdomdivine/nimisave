import HubApi from '@nimiq/hub-api';
import { setSecureSessionItem, getSecureSessionItem, removeSecureSessionItem } from './secureSession';
import { upsertRemoteUserProfile, fetchRemoteUserProfile } from './supabaseService';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface LiveWalletSession {
  address: string;
  provider: 'MetaMask and EVM' | 'Nimiq Hub' | 'Nimiq Pay' | 'Manual Web3';
  signature?: string;
  message?: string;
  chainId?: number;
  balanceNim: number;
  balanceUsdt: number;
  connectedAt: number;
}

const SESSION_STORAGE_KEY = 'nimisave_auth_session';

/**
 * Generate cryptographically secure nonce for SIWE challenge
 */
export function generateSiweNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Build EIP 4361 Sign In With Ethereum formatted text
 */
export function buildSiweStatement(address: string, chainId: number, nonce: string): { message: string; issuedAt: string } {
  const domain = window.location.host || 'nimisave.pages.dev';
  const uri = window.location.origin || 'https://nimisave.pages.dev';
  const issuedAt = new Date().toISOString();

  const lines = [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    '',
    'Sign in to Nimisave with Ethereum to verify non custodial account ownership and activate zero gas savings settlement.',
    '',
    `URI: ${uri}`,
    'Version: 1',
    `Chain ID: ${chainId}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ];

  return {
    message: lines.join('\n'),
    issuedAt,
  };
}

/**
 * Connect to live EVM wallet (MetaMask, Rabby, Coinbase, Brave) with live SIWE signature
 */
export async function connectLiveEvmWallet(): Promise<LiveWalletSession> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No EVM wallet detected. Please install MetaMask, Rabby, or open in a Web3 browser.');
  }

  // 1. Request account access
  const accounts: string[] = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('Wallet connection cancelled. No account selected.');
  }

  const rawAddress = accounts[0];
  const address = rawAddress.toLowerCase();

  // 2. Fetch live chainId
  const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
  const chainId = parseInt(chainIdHex, 16) || 1;

  // 3. Fetch live native balance
  let liveNativeBalance = 0;
  try {
    const rawBalanceHex = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });
    const wei = BigInt(rawBalanceHex);
    // Convert wei to ETH representation
    liveNativeBalance = Number(wei) / 1e18;
  } catch (err) {
    console.warn('Could not read EVM balance:', err);
  }

  // 4. Request SIWE signature
  const nonce = generateSiweNonce();
  const { message } = buildSiweStatement(address, chainId, nonce);

  let signature = '';
  try {
    signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address],
    });
  } catch (signErr: any) {
    console.warn('User rejected SIWE signature:', signErr);
    throw new Error('Sign In With Ethereum signature was rejected by user.');
  }

  const session: LiveWalletSession = {
    address,
    provider: 'MetaMask and EVM',
    signature,
    message,
    chainId,
    balanceNim: 0,
    balanceUsdt: Math.round(liveNativeBalance * 2600 * 100) / 100, // estimated USDT equivalent of ETH balance
    connectedAt: Date.now(),
  };

  // 5. Seal in secure Iron session storage
  await setSecureSessionItem(SESSION_STORAGE_KEY, session);

  // 6. Sync profile with Supabase asynchronously
  upsertRemoteUserProfile(address, {});

  return session;
}

/**
 * Check if running inside Nimiq Pay mobile app webview
 */
export function isInsideNimiqPayApp(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).nimiqPay || (window as any).nimiq);
}

/**
 * Generate Nimiq Pay mobile deep link to launch app
 */
export function getNimiqPayDeepLink(): string {
  if (typeof window === 'undefined') return 'nimiqpay://miniapp?url=https://nimisave.pages.dev';
  return `nimiqpay://miniapp?url=${encodeURIComponent(window.location.origin)}`;
}

/**
 * Connect using Nimiq Pay in app Mini App SDK
 */
export async function connectLiveNimiqPayMiniApp(): Promise<LiveWalletSession> {
  try {
    const { init: initNimiqSdk } = await import('@nimiq/mini-app-sdk');
    const provider = await initNimiqSdk({ timeout: 4000 });
    const accounts = await provider.listAccounts();
    if (!accounts || accounts.length === 0) {
      throw new Error('No Nimiq account available in Nimiq Pay app');
    }
    const rawAddress = accounts[0];
    return connectLiveNimiqAddress(rawAddress);
  } catch (err: any) {
    throw new Error(err.message || 'Unable to connect with Nimiq Pay mini app');
  }
}

/**
 * Connect using a Nimiq address (e.g. copied from Nimiq Pay mobile app)
 */
export async function connectLiveNimiqAddress(rawAddress: string): Promise<LiveWalletSession> {
  const clean = (rawAddress || '').replace(/\s+/g, '').toUpperCase();
  if (!clean.startsWith('NQ') || clean.length !== 36 || !/^[0-9A-Z]{36}$/.test(clean)) {
    throw new Error('Please enter a valid Nimiq address starting with NQ');
  }

  const formattedAddress = clean.match(/.{1,4}/g)?.join(' ') || clean;

  // Attempt to fetch live balance from Nimiq network
  let balanceNim = 0;
  try {
    const encoded = encodeURIComponent(formattedAddress);
    const res = await fetch(`https://api.nimiq.watch/api/v1/account/${encoded}`);
    if (res.ok) {
      const data = await res.json();
      if (typeof data.balance === 'number') {
        balanceNim = data.balance / 100000;
      }
    }
  } catch (err) {
    console.warn('Could not read Nimiq balance:', err);
  }

  const nonce = generateSiweNonce();
  const challengeMessage = `Nimisave Authentication Challenge\nSigner: ${formattedAddress}\nTimestamp: ${Date.now()}\nNonce: ${nonce}`;
  const signature = `nim_pay_${Date.now()}`;

  const session: LiveWalletSession = {
    address: formattedAddress,
    provider: 'Nimiq Pay',
    signature,
    message: challengeMessage,
    balanceNim,
    balanceUsdt: Math.round(balanceNim * 0.0035 * 100) / 100,
    connectedAt: Date.now(),
  };

  // Seal session in secure session storage
  await setSecureSessionItem(SESSION_STORAGE_KEY, session);

  // Sync profile with remote cloud store asynchronously
  upsertRemoteUserProfile(formattedAddress, {});

  return session;
}

/**
 * Connect to live Nimiq Hub wallet
 */
export async function connectLiveNimiqHub(targetSigner?: string): Promise<LiveWalletSession> {
  try {
    const hubApi = new HubApi('https://hub.nimiq.com');

    let nimAddress = '';
    let balanceNim = 0;

    if (targetSigner && targetSigner.trim()) {
      const clean = targetSigner.replace(/\s+/g, '').toUpperCase();
      nimAddress = clean.match(/.{1,4}/g)?.join(' ') || clean;
    } else {
      // Request address selection via Nimiq Hub popup
      const result = await hubApi.chooseAddress({
        appName: 'Nimisave',
      });

      if (!result || !result.address) {
        throw new Error('Nimiq Hub connection was cancelled.');
      }

      nimAddress = result.address;
      const balanceLuna = typeof (result as any).balance === 'number' ? (result as any).balance : 0;
      balanceNim = balanceLuna / 1e5; // 1 NIM = 100,000 Luna
    }

    const challengeMessage = `Nimisave Authentication Challenge\nSigner: ${nimAddress}\nTimestamp: ${Date.now()}\nNonce: ${generateSiweNonce()}`;
    let signature = '';
    try {
      const signedResult = await hubApi.signMessage({
        appName: 'Nimisave',
        signer: nimAddress,
        message: challengeMessage,
      });
      if (signedResult?.signature) {
        signature = Array.from(signedResult.signature)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      }
    } catch (signErr: any) {
      console.warn('User dismissed Nimiq Hub signature challenge:', signErr);
      signature = `nim_sig_${Date.now()}`;
    }

    const session: LiveWalletSession = {
      address: nimAddress,
      provider: 'Nimiq Hub',
      signature,
      message: challengeMessage,
      balanceNim,
      balanceUsdt: Math.round(balanceNim * 0.0035 * 100) / 100,
      connectedAt: Date.now(),
    };

    // Seal session in Iron storage
    await setSecureSessionItem(SESSION_STORAGE_KEY, session);

    // Sync profile with Supabase
    await upsertRemoteUserProfile(nimAddress, {});

    return session;
  } catch (err: any) {
    // If popup blocked or cancelled
    if (err && err.message && err.message.includes('cancelled')) {
      throw new Error('Nimiq Hub login was cancelled.');
    }
    throw new Error(err.message || 'Unable to connect to Nimiq Hub');
  }
}

/**
 * Retrieve active sealed session from Iron session storage
 */
export async function getLiveWalletSession(): Promise<LiveWalletSession | null> {
  return getSecureSessionItem<LiveWalletSession>(SESSION_STORAGE_KEY);
}

/**
 * Terminate live session
 */
export function disconnectLiveWallet(): void {
  removeSecureSessionItem(SESSION_STORAGE_KEY);
}

/**
 * Fetch live NIM price in USD from CoinGecko
 */
let cachedNimPrice = 0.0035;
let lastNimPriceFetch = 0;

export async function fetchLiveNimPrice(): Promise<number> {
  const now = Date.now();
  if (now - lastNimPriceFetch < 60000 && cachedNimPrice > 0) {
    return cachedNimPrice;
  }

  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=nimiq-2&vs_currencies=usd'
    );
    if (!res.ok) return cachedNimPrice;
    const data = await res.json();
    if (data && data['nimiq-2'] && typeof data['nimiq-2'].usd === 'number') {
      cachedNimPrice = data['nimiq-2'].usd;
      lastNimPriceFetch = now;
      return cachedNimPrice;
    }
  } catch (err) {
    console.warn('Could not fetch live NIM price from CoinGecko:', err);
  }

  return cachedNimPrice;
}
