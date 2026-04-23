import { db } from "./client";

// Row/return types
export type WorkerRow = {
  worker_number: string;
  name: string;
  active: number;
  created_at: string;
};

export type RateRow = {
  id: number;
  cents_per_kg: number;
  currency_code: string;
  effective_from: string;
  created_at: string;
};

export type WeighInInsertInput = {
  workerNumber: string;
  weightGrams: number;
  rateCentsPerKgSnapshot: number;
  currencyCodeSnapshot: string;
};

export type WeighInRow = {
  id: number;
  worker_number: string;
  weight_grams: number;
  rate_cents_per_kg_snapshot: number;
  currency_code_snapshot: string;
  recorded_at: string;
};

export type PaymentInsertInput = {
  workerNumber: string;
  amountCents: number;
  currencyCodeSnapshot: string;
  note?: string;
};

export type WorkerSummaryRow = {
  totalWeightGrams: number;
  totalEarnedCents: number;
  totalPaidCents: number;
};

// Worker query functions
const getWorkerStatement = db.prepare(`
  SELECT
    worker_number,
    name,
    active,
    created_at
  FROM workers
  WHERE worker_number = ?
`);

export function getWorker(workerNumber: string): WorkerRow | undefined {
  return getWorkerStatement.get(workerNumber) as WorkerRow | undefined;
}

const ensureWorkerStatement = db.prepare(`
  INSERT INTO workers (
    worker_number,
    name,
    active
  ) VALUES (
    @workerNumber,
    @name,
    1
  )
  ON CONFLICT(worker_number) DO NOTHING
`);

export function ensureWorker(workerNumber: string): WorkerRow {
  ensureWorkerStatement.run({
    workerNumber,
    name: `Worker ${workerNumber}`,
  });

  const worker = getWorker(workerNumber);
  if (!worker) {
    throw new Error("Failed to create or load worker");
  }

  return worker;
}

// Rate query functions
const getLatestRateStatement = db.prepare(`
  SELECT
    id,
    cents_per_kg,
    currency_code,
    effective_from,
    created_at
  FROM
    rates
  ORDER BY
  effective_from
   DESC, id
   DESC
  LIMIT 1
`);

export function getLatestRate(): RateRow | undefined {
  return getLatestRateStatement.get() as RateRow | undefined;
}

// Weigh-in query functions
const insertWeighInStatement = db.prepare(`
  INSERT INTO weigh_ins (
    worker_number,
    weight_grams,
    rate_cents_per_kg_snapshot,
    currency_code_snapshot
  ) VALUES (
    @workerNumber,
    @weightGrams,
    @rateCentsPerKgSnapshot,
    @currencyCodeSnapshot
  )
`);

const getWeighInByIdStatement = db.prepare(`
  SELECT
    id,
    worker_number,
    weight_grams,
    rate_cents_per_kg_snapshot,
    currency_code_snapshot,
    recorded_at
  FROM weigh_ins
  WHERE id = ?
`);

export function insertWeighIn(input: WeighInInsertInput): WeighInRow {
  const result = insertWeighInStatement.run(input);
  const insertedId = Number(result.lastInsertRowid);
  const weighIn = getWeighInByIdStatement.get(insertedId) as WeighInRow | undefined;

  if (!weighIn) {
    throw new Error("Failed to fetch inserted weigh-in");
  }

  return weighIn;
}

// Payment query functions
const insertPaymentStatement = db.prepare(`
  INSERT INTO payments (
    worker_number,
    amount_cents,
    currency_code_snapshot,
    note
  ) VALUES (
    @workerNumber,
    @amountCents,
    @currencyCodeSnapshot,
    @note
  )
`);

export function insertPayment(input: PaymentInsertInput): void {
  insertPaymentStatement.run({
    ...input,
    note: input.note ?? null,
  });
}

// Summary query functions
const getWorkerSummaryStatement = db.prepare(`
  SELECT
    COALESCE(
      (SELECT SUM(weight_grams) FROM weigh_ins WHERE worker_number = ?),
      0
    ) AS totalWeightGrams,
    COALESCE(
      (
        SELECT SUM(
          CAST(ROUND((weight_grams / 1000.0) * rate_cents_per_kg_snapshot) AS INTEGER)
        )
        FROM weigh_ins
        WHERE worker_number = ?
      ),
      0
    ) AS totalEarnedCents,
    COALESCE(
      (SELECT SUM(amount_cents) FROM payments WHERE worker_number = ?),
      0
    ) AS totalPaidCents
`);

export function getWorkerSummary(workerNumber: string): WorkerSummaryRow {
  return getWorkerSummaryStatement.get(
    workerNumber,
    workerNumber,
    workerNumber,
  ) as WorkerSummaryRow;
}
