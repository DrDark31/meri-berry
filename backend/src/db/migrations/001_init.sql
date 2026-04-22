PRAGMA foreign_keys = ON;

BEGIN;

CREATE TABLE workers (
  worker_number TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE app_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  currency_code TEXT NOT NULL
    CHECK (length(currency_code) = 3 AND currency_code = upper(currency_code)),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO app_config (id, currency_code) VALUES (1, 'AUD');

CREATE TABLE rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cents_per_kg INTEGER NOT NULL CHECK (cents_per_kg > 0),
  currency_code TEXT NOT NULL
    CHECK (length(currency_code) = 3 AND currency_code = upper(currency_code)),
  effective_from TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE weigh_ins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_number TEXT NOT NULL,
  weight_grams INTEGER NOT NULL CHECK (weight_grams > 0),
  rate_cents_per_kg_snapshot INTEGER NOT NULL CHECK (rate_cents_per_kg_snapshot > 0),
  currency_code_snapshot TEXT NOT NULL
    CHECK (
      length(currency_code_snapshot) = 3
      AND currency_code_snapshot = upper(currency_code_snapshot)
    ),
  recorded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (worker_number) REFERENCES workers(worker_number)
);

CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_number TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency_code_snapshot TEXT NOT NULL
    CHECK (
      length(currency_code_snapshot) = 3
      AND currency_code_snapshot = upper(currency_code_snapshot)
    ),
  recorded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  note TEXT,
  FOREIGN KEY (worker_number) REFERENCES workers(worker_number)
);

CREATE INDEX idx_weigh_ins_worker_time
  ON weigh_ins (worker_number, recorded_at);

CREATE INDEX idx_payments_worker_time
  ON payments (worker_number, recorded_at);

COMMIT;
