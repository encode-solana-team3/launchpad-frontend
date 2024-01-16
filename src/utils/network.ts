export const getExplorerUrl = (txHash: string | undefined) => {
  if (!txHash) return "#";
  return `https://explorer.solana.com/tx/${txHash}?cluster=${process.env.NEXT_PUBLIC_NETWORK}`;
};
