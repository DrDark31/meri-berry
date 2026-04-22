import { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  addWeighIn,
  calculateEarnedCentsForGrams,
  findWorker,
  getWorkerSummary,
  gramsToKg,
  kgToGrams,
} from "../data/store";

const createWeighInBodySchema = z.object({
  workerNumber: z.string().trim().min(1, "workerNumber is required"),
  weightKg: z.number().positive("weightKg must be greater than 0"),
});

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
    const worker = findWorker(workerNumber);

    if (!worker) {
      return reply.code(404).send({ message: "Worker not found" });
    }

    const weightGrams = kgToGrams(weightKg);

    const weighIn = addWeighIn({
      workerNumber,
      weightGrams,
    });

    const workerSummary = getWorkerSummary(workerNumber);

    return reply.code(201).send({
      weighIn: {
        id: weighIn.id,
        workerNumber: weighIn.workerNumber,
        weightKg: gramsToKg(weighIn.weightGrams),
        earnedCents: calculateEarnedCentsForGrams(weighIn.weightGrams),
        recordedAt: weighIn.recordedAt,
      },
      workerSummary,
    });
  });
}
