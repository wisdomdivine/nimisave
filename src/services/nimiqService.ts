export interface NimiqTxResult {
  txHash: string;
  sender: string;
  recipient: string;
  amountNim: number;
  amountUsd: number;
  gasSponsored: boolean;
  timestamp: string;
}

export const NIM_USD_RATE = 0.0035;

export const formatNimiqAddress = (address: string): string => {
  const clean = address.replace(/\s+/g, '');
  return clean.match(/.{1,4}/g)?.join(' ') || address;
};

export const usdToNim = (usdAmount: number): number => {
  return Math.round((usdAmount / NIM_USD_RATE) * 100) / 100;
};

export const nimToUsd = (nimAmount: number): number => {
  return Math.round(nimAmount * NIM_USD_RATE * 100) / 100;
};

export const simulateNimiqSettlement = async (
  recipientAddress: string,
  amountUsd: number
): Promise<NimiqTxResult> => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const hexChars = '0123456789abcdef';
  let randomHash = '';
  for (let i = 0; i < 64; i += 1) {
    randomHash += hexChars[Math.floor(Math.random() * hexChars.length)];
  }

  const nimAmount = usdToNim(amountUsd);

  return {
    txHash: randomHash,
    sender: 'NQ33 Y66V 8U30 G98N R9T4 Y9EB 8X5L 4D94 9NFE',
    recipient: recipientAddress,
    amountNim: nimAmount,
    amountUsd,
    gasSponsored: true,
    timestamp: new Date().toISOString(),
  };
};

export const calculateWithdrawalDetails = (
  amount: number,
  isEmergency: boolean,
  freeWithdrawalsRemaining: number
) => {
  if (isEmergency && freeWithdrawalsRemaining > 0) {
    return {
      grossAmount: amount,
      fee: 0,
      netAmount: amount,
      isFreeEmergency: true,
      explanation: 'Free emergency withdrawal applied. No fee deducted.',
    };
  }

  const standardFeeRate = 0.02;
  const rawFee = amount * standardFeeRate;
  const cappedFee = Math.min(rawFee, 15);
  const netAmount = Math.max(0, amount - cappedFee);

  return {
    grossAmount: amount,
    fee: Math.round(cappedFee * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
    isFreeEmergency: false,
    explanation: 'Disclosed administrative fee capped at 15 dollars.',
  };
};

