CREATE TABLE customer_users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT customer_users_email_normalized
    CHECK (email = lower(btrim(email)))
);

CREATE UNIQUE INDEX idx_customer_users_email
  ON customer_users(email);

CREATE TABLE customer_sessions (
  token_hash CHAR(64) PRIMARY KEY
    CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  customer_id BIGINT NOT NULL
    REFERENCES customer_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_sessions_customer_id
  ON customer_sessions(customer_id);

CREATE INDEX idx_customer_sessions_expires_at
  ON customer_sessions(expires_at);
