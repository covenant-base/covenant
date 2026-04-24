import { covenantBrand } from '@covenant/config/brand';
import { truncateAddress } from '@covenant/sdk';
import { formatUnits } from 'viem';

export function formatTokenAmount(value?: string | number | bigint | null, symbol = covenantBrand.token.symbol) {
  if (value == null) return '--';

  try {
    const normalized = typeof value === 'bigint' ? value : BigInt(value.toString());
    const amount = formatUnits(normalized, covenantBrand.token.decimals);
    const numeric = Number(amount);
    const pretty = Number.isFinite(numeric) ? numeric.toLocaleString('en-US', { maximumFractionDigits: 2 }) : amount;
    return `${pretty} ${symbol}`;
  } catch {
    return value.toString();
  }
}

export function formatAddress(value?: string | null, width = 4) {
  return truncateAddress(value, width) || '--';
}

export function formatDateTime(value?: string | null) {
  if (!value) return '--';

  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function formatInteger(value?: string | number | null) {
  if (value == null) return '--';

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toLocaleString('en-US') : value.toString();
}

export function formatPercent(value?: number | null) {
  if (value == null) return '--';
  return `${value}%`;
}
