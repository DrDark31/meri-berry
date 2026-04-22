import Database from "better-sqlite3";
import path from "node:path";

const dbPath = path.resolve(__dirname, "../../data/meri-berry.db");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

export { db, dbPath };
