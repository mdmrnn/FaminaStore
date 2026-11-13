ALTER TABLE orders
  ADD COLUMN idempotency_key UUID,
  ADD COLUMN request_hash CHAR(64),
  ADD CONSTRAINT orders_idempotency_key_unique UNIQUE (idempotency_key),
  ADD CONSTRAINT orders_idempotency_request_hash_check
    CHECK ((idempotency_key IS NULL) = (request_hash IS NULL));
