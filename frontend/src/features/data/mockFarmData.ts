import { type WorkerProfile, type WorkerTotals } from "../../types/farm";

export const RATE_CENTS_PER_KG = 350;
export const CURRENCY_CODE = "AUD";

export const workerProfiles: Record<string, WorkerProfile> = {
  "101": {
    workerNumber: "101",
    name: "Sample Worker",
    active: true,
    createdAt: "2026-04-22T12:50:01.888Z",
  },
  "102": {
    workerNumber: "102",
    name: "Second Worker",
    active: true,
    createdAt: "2026-04-22T12:50:01.888Z",
  },
};

export const initialTotals: Record<string, WorkerTotals> = {
  "101": {
    totalWeightGrams: 22400,
    totalEarnedCents: 7840,
    totalPaidCents: 3000,
  },
  "102": {
    totalWeightGrams: 0,
    totalEarnedCents: 0,
    totalPaidCents: 0,
  },
};
