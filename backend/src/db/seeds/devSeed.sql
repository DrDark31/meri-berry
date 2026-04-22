BEGIN;

-- Change this if you want to run the app in another currency for local testing.
UPDATE app_config
SET currency_code = 'AUD',
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE id = 1;

INSERT INTO workers (worker_number, name) VALUES
  ('101', 'Sample Worker'),
  ('102', 'Second Worker');

INSERT INTO rates (cents_per_kg, currency_code, effective_from)
SELECT
  350,
  currency_code,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM app_config
WHERE id = 1;

INSERT INTO weigh_ins (
  worker_number,
  weight_grams,
  rate_cents_per_kg_snapshot,
  currency_code_snapshot
)
SELECT
  '101',
  22400,
  cents_per_kg,
  currency_code
FROM rates
ORDER BY effective_from DESC, id DESC
LIMIT 1;

INSERT INTO payments (worker_number, amount_cents, currency_code_snapshot, note)
SELECT
  '101',
  3000,
  currency_code,
  'Sample payment'
FROM app_config
WHERE id = 1;

COMMIT;
