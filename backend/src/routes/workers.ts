import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { findWorker, getWorkerSummary } from "../data/store";

type WorkerParams = {
  workerNumber: string;
};

async function sendWorkerSummary(
  request: FastifyRequest<{ Params: WorkerParams }>,
  reply: FastifyReply,
) {
  const { workerNumber } = request.params;
  const worker = findWorker(workerNumber);

  if (!worker) {
    return reply.code(404).send({ message: "Worker not found" });
  }

  const summary = getWorkerSummary(workerNumber);

  return {
    worker,
    summary,
  };
}

export async function workerRoutes(app: FastifyInstance) {
  app.get<{ Params: WorkerParams }>("/workers/:workerNumber", sendWorkerSummary);
  app.get<{ Params: WorkerParams }>("/workers/:workerNumber/summary", sendWorkerSummary);
}
