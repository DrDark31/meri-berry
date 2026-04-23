import { type WorkerTotals } from "../types/farm";

export function kgToGrams(kg: number): number {
  return Math.round(kg * 1000);
}

export function gramsToKg(grams: number): number {
  return Number((grams / 1000).toFixed(3));
}

export function calculateEarnedCentsForKg(kg: number, rateCentsPerKg: number): number {
  return Math.round(kg * rateCentsPerKg);
}

export function calcOutstandingCents(totals: WorkerTotals): number {
  return Math.max(totals.totalEarnedCents - totals.totalPaidCents, 0);
}
