import fs from "node:fs/promises";
import path from "node:path";
import { db } from "./client";

async function runMigrations() {
  const migrationsDir = path.resolve(__dirname, "migrations");
  const seedFile = path.resolve(__dirname, "seeds/devSeed.sql");

  const files = (await fs.readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    const sql = await fs.readFile(fullPath, "utf-8");
    db.exec(sql);
    console.log(`Applied migration: ${file}`);
  }

  if (process.env.NODE_ENV !== "production") {
    const seedSql = await fs.readFile(seedFile, "utf-8");
    db.exec(seedSql);
    console.log("Applied dev seed");
  }
}

runMigrations()
  .then(() => console.log("DB setup complete"))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => db.close());
  