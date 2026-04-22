import { buildApp } from "./app";

const start = async () => {
  const app = buildApp();

  try {
    const port = Number(process.env.PORT ?? 3001);
    await app.listen({ port, host: "0.0.0.0" });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
