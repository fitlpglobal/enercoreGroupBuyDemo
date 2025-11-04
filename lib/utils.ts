import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Linear pricing helper using y = m x + c
// - startingPrice: price at x=0 (c)
// - finalPrice: target lowest price at x = targetQuantity
// - targetQuantity: buyer count needed to reach finalPrice
// - currentQuantity: current buyer count
// Returns a price clamped between finalPrice and startingPrice.
export function calculateLinearPrice(
  startingPrice: number,
  finalPrice: number,
  targetQuantity: number,
  currentQuantity: number
): number {
  const s = Number(startingPrice);
  const f = Number(finalPrice);
  const t = Math.max(0, Number(targetQuantity));
  const x = Math.max(0, Number(currentQuantity));

  if (!isFinite(s) || !isFinite(f) || !isFinite(t) || t === 0) return s;

  // m = (f - s) / t, c = s
  const m = (f - s) / t;
  const y = s + m * Math.min(x, t);
  // Clamp to [min(s,f), max(s,f)] and round to 2 decimals
  const low = Math.min(s, f);
  const high = Math.max(s, f);
  const clamped = Math.min(Math.max(y, low), high);
  return Math.round(clamped * 100) / 100;
}
