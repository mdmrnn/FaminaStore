ALTER TABLE orders
  DROP CONSTRAINT orders_payment_method_check;

ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('manual', 'zarinpal'));

CREATE TABLE payment_attempts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'zarinpal',
  authority TEXT,
  reference_id TEXT,
  amount_toman BIGINT NOT NULL CHECK (amount_toman > 0),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMPTZ,
  CONSTRAINT payment_attempts_paid_requires_verification
    CHECK (status <> 'paid' OR verified_at IS NOT NULL)
);

CREATE UNIQUE INDEX idx_payment_attempts_provider_authority
  ON payment_attempts(provider, authority)
  WHERE authority IS NOT NULL;

CREATE INDEX idx_payment_attempts_order_created_at
  ON payment_attempts(order_id, created_at DESC);
