import { Currency } from '../types';

export interface NimiqTxResult {
  txHash: string;
  sender: string;
  recipient: string;
  amount: number;
  currency: Currency;
  nimEquivalent: number;
  usdtEquivalent: number;
  gasSponsored: boolean;
  timestamp: string;
}

export const NIM_USD_RATE = 0.0035;

export const formatNimiqAddress = (address?: string): string => {
  if (!address) return '';
  const clean = address.trim();
  if (clean.startsWith('0x')) {
    if (clean.length <= 12) return clean;
    return `${clean.slice(0, 6)}...${clean.slice(-4)}`;
  }
  const stripped = clean.replace(/\s+/g, '');
  return stripped.match(/.{1,4}/g)?.join(' ') || address;
};

export const usdtToNim = (usdtAmount?: number | null): number => {
  const safe = typeof usdtAmount === 'number' && !isNaN(usdtAmount) ? usdtAmount : 0;
  return Math.round((safe / NIM_USD_RATE) * 100) / 100;
};

export const nimToUsdt = (nimAmount?: number | null): number => {
  const safe = typeof nimAmount === 'number' && !isNaN(nimAmount) ? nimAmount : 0;
  return Math.round(safe * NIM_USD_RATE * 100) / 100;
};

export const formatAmount = (amount?: number | null, currency?: Currency | string): string => {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  if (currency === 'NIM') {
    return `${safeAmount.toLocaleString()} NIM`;
  }
  return `${safeAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USDT`;
};

export const executeSettlement = async (
  senderAddress: string,
  recipientAddress: string,
  amount: number,
  currency: Currency = 'USDT'
): Promise<NimiqTxResult> => {
  const timestamp = new Date().toISOString();
  const rawPayload = `${senderAddress}:${recipientAddress}:${amount}:${currency}:${timestamp}:${Math.random()}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawPayload));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const txHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  const nimEquivalent = currency === 'NIM' ? amount : usdtToNim(amount);
  const usdtEquivalent = currency === 'NIM' ? nimToUsdt(amount) : amount;

  return {
    txHash,
    sender: senderAddress || 'NQ33 Y66V 8U30 G98N R9T4 Y9EB 8X5L 4D94 9NFE',
    recipient: recipientAddress || senderAddress,
    amount,
    currency,
    nimEquivalent,
    usdtEquivalent,
    gasSponsored: true,
    timestamp,
  };
};

export const simulateNimiqSettlement = async (
  recipientAddress: string,
  amount: number,
  currency: Currency = 'USDT'
): Promise<NimiqTxResult> => {
  return executeSettlement(recipientAddress, recipientAddress, amount, currency);
};

export const calculateWithdrawalDetails = (
  amount: number,
  currency: Currency,
  isEmergency: boolean,
  freeWithdrawalsRemaining: number
) => {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const safeFree = typeof freeWithdrawalsRemaining === 'number' ? freeWithdrawalsRemaining : 0;

  if (isEmergency && safeFree > 0) {
    return {
      grossAmount: safeAmount,
      fee: 0,
      netAmount: safeAmount,
      currency,
      isFreeEmergency: true,
      explanation: 'Free emergency withdrawal applied. No fee deducted.',
    };
  }

  const standardFeeRate = 0.02;
  const rawFee = safeAmount * standardFeeRate;
  const cappedFee = currency === 'NIM' ? Math.min(rawFee, Math.round(15 / NIM_USD_RATE)) : Math.min(rawFee, 15);
  const netAmount = Math.max(0, safeAmount - cappedFee);

  return {
    grossAmount: safeAmount,
    fee: Math.round(cappedFee * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
    currency,
    isFreeEmergency: false,
    explanation: currency === 'NIM' ? 'Disclosed fee capped at equivalent of 15 dollars' : 'Disclosed fee capped at 15 dollars',
  };
};
