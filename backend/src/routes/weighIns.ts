import { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  ensureWorker,
  getLatestRate,
  getWorkerSummary,
  insertWeighIn,
} from "../db/queries";

const createWeighInBodySchema = z.object({
  workerNumber: z.string().trim().min(1, "workerNumber is required"),
  weightKg: z.number().positive("weightKg must be greater than 0"),
});

function kgToGrams(kg: number): number {
  return Math.round(kg * 1000);
}

function gramsToKg(grams: number): number {
  return Number((grams / 1000).toFixed(3));
}

function calculateEarnedCentsForGrams(grams: number, rateCentsPerKg: number): number {
  return Math.round((grams / 1000) * rateCentsPerKg);
}

export async function weighInRoutes(app: FastifyInstance) {
  app.post("/weigh-ins", async (request, reply) => {
    const parsedBody = createWeighInBodySchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.code(400).send({
        message: "Invalid weigh-in payload",
        issues: parsedBody.error.issues,
      });
    }

    const { workerNumber, weightKg } = parsedBody.data;
    ensureWorker(workerNumber);

    const latestRate = getLatestRate();

    if (!latestRate) {
      return reply.code(500).send({ message: "No pay rate configured" });
    }

    const weightGrams = kgToGrams(weightKg);

    const weighIn = insertWeighIn({
      workerNumber,
      weightGrams,
      rateCentsPerKgSnapshot: latestRate.cents_per_kg,
      currencyCodeSnapshot: latestRate.currency_code,
    });

    const workerSummary = getWorkerSummary(workerNumber);
    const outstandingCents = Math.max(
      workerSummary.totalEarnedCents - workerSummary.totalPaidCents,
      0,
    );

    return reply.code(201).send({
      weighIn: {
        id: weighIn.id,
        workerNumber: weighIn.worker_number,
        weightKg: gramsToKg(weighIn.weight_grams),
        earnedCents: calculateEarnedCentsForGrams(
          weighIn.weight_grams,
          weighIn.rate_cents_per_kg_snapshot,
        ),
        currencyCode: weighIn.currency_code_snapshot,
        recordedAt: weighIn.recorded_at,
      },
      workerSummary: {
        ...workerSummary,
        outstandingCents,
      },
    });
  });
}
