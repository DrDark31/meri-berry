import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getWorker, getWorkerSummary } from "../db/queries";

type WorkerParams = {
  workerNumber: string;
};

function gramsToKg(grams: number): number {
  return Number((grams / 1000).toFixed(3));
}

async function sendWorkerSummary(
  request: FastifyRequest<{ Params: WorkerParams }>,
  reply: FastifyReply,
) {
  const { workerNumber } = request.params;
  const worker = getWorker(workerNumber);

  if (!worker) {
    return reply.code(404).send({ message: "Worker not found" });
  }

  const summary = getWorkerSummary(workerNumber);
  const outstandingCents = Math.max(summary.totalEarnedCents - summary.totalPaidCents, 0);

  return {
    worker: {
      workerNumber: worker.worker_number,
      name: worker.name,
      active: worker.active === 1,
      createdAt: worker.created_at,
    },
    summary: {
      totalWeightGrams: summary.totalWeightGrams,
      totalWeightKg: gramsToKg(summary.totalWeightGrams),
      totalEarnedCents: summary.totalEarnedCents,
      totalPaidCents: summary.totalPaidCents,
      outstandingCents,
    },
  };
}

export async function workerRoutes(app: FastifyInstance) {
  app.get<{ Params: WorkerParams }>("/workers/:workerNumber", sendWorkerSummary);
  app.get<{ Params: WorkerParams }>("/workers/:workerNumber/summary", sendWorkerSummary);
}
