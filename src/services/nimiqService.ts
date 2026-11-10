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

export const formatNimiqAddress = (address: string): string => {
  const clean = address.replace(/\s+/g, '');
  return clean.match(/.{1,4}/g)?.join(' ') || address;
};

export const usdtToNim = (usdtAmount: number): number => {
  return Math.round((usdtAmount / NIM_USD_RATE) * 100) / 100;
};

export const nimToUsdt = (nimAmount: number): number => {
  return Math.round(nimAmount * NIM_USD_RATE * 100) / 100;
};

export const formatAmount = (amount: number, currency: Currency): string => {
  if (currency === 'NIM') {
    return `${amount.toLocaleString()} NIM`;
  }
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USDT`;
};

export const simulateNimiqSettlement = async (
  recipientAddress: string,
  amount: number,
  currency: Currency = 'USDT'
): Promise<NimiqTxResult> => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const hexChars = '0123456789abcdef';
  let randomHash = '';
  for (let i = 0; i < 64; i += 1) {
    randomHash += hexChars[Math.floor(Math.random() * hexChars.length)];
  }

  const nimEquivalent = currency === 'NIM' ? amount : usdtToNim(amount);
  const usdtEquivalent = currency === 'NIM' ? nimToUsdt(amount) : amount;

  return {
    txHash: randomHash,
    sender: 'NQ33 Y66V 8U30 G98N R9T4 Y9EB 8X5L 4D94 9NFE',
    recipient: recipientAddress,
    amount,
    currency,
    nimEquivalent,
    usdtEquivalent,
    gasSponsored: true,
    timestamp: new Date().toISOString(),
  };
};

export const calculateWithdrawalDetails = (
  amount: number,
  currency: Currency,
  isEmergency: boolean,
  freeWithdrawalsRemaining: number
) => {
  if (isEmergency && freeWithdrawalsRemaining > 0) {
    return {
      grossAmount: amount,
      fee: 0,
      netAmount: amount,
      currency,
      isFreeEmergency: true,
      explanation: 'Free emergency withdrawal applied. No fee deducted.',
    };
  }

  const standardFeeRate = 0.02;
  const rawFee = amount * standardFeeRate;
  const cappedFee = currency === 'NIM' ? Math.min(rawFee, Math.round(15 / NIM_USD_RATE)) : Math.min(rawFee, 15);
  const netAmount = Math.max(0, amount - cappedFee);

  return {
    grossAmount: amount,
    fee: Math.round(cappedFee * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
    currency,
    isFreeEmergency: false,
    explanation: currency === 'NIM' ? 'Disclosed fee capped at equivalent of 15 dollars' : 'Disclosed fee capped at 15 dollars',
  };
};
