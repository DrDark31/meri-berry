import { randomUUID } from "crypto";

export const RATE_CENTS_PER_KG = 350;

export type Worker = {
  workerNumber: string;
  name: string;
};

export type WeighIn = {
  id: string;
  workerNumber: string;
  weightGrams: number;
  recordedAt: string;
};

export type Payment = {
  id: string;
  workerNumber: string;
  amountCents: number;
  recordedAt: string;
};

const workers = new Map<string, Worker>([
  ["101", { workerNumber: "101", name: "Sample Worker" }],
  ["102", { workerNumber: "102", name: "Second Worker" }],
]);

const weighIns: WeighIn[] = [];
const payments: Payment[] = [];

export function findWorker(workerNumber: string): Worker | undefined {
  return workers.get(workerNumber);
}

export function kgToGrams(kg: number): number {
  return Math.round(kg * 1000);
}

export function gramsToKg(grams: number): number {
  return Number((grams / 1000).toFixed(3));
}

export function calculateEarnedCentsForGrams(grams: number): number {
  return Math.round((grams / 1000) * RATE_CENTS_PER_KG);
}

export function addWeighIn(input: {
  workerNumber: string;
  weightGrams: number;
}): WeighIn {
  const weighIn: WeighIn = {
    id: randomUUID(),
    workerNumber: input.workerNumber,
    weightGrams: input.weightGrams,
    recordedAt: new Date().toISOString(),
  };

  weighIns.push(weighIn);
  return weighIn;
}

export function getWorkerSummary(workerNumber: string) {
  const workerWeighIns = weighIns.filter((entry) => entry.workerNumber === workerNumber);
  const workerPayments = payments.filter((entry) => entry.workerNumber === workerNumber);

  const totalWeightGrams = workerWeighIns.reduce((sum, entry) => sum + entry.weightGrams, 0);
  const totalEarnedCents = calculateEarnedCentsForGrams(totalWeightGrams);
  const totalPaidCents = workerPayments.reduce((sum, entry) => sum + entry.amountCents, 0);
  const outstandingCents = Math.max(totalEarnedCents - totalPaidCents, 0);
  const totalWeightLeftToPayKg = gramsToKg(
    Math.round((outstandingCents / RATE_CENTS_PER_KG) * 1000),
  );

  return {
    totalWeightKg: gramsToKg(totalWeightGrams),
    totalEarnedCents,
    totalPaidCents,
    outstandingCents,
    totalWeightLeftToPayKg,
  };
}
