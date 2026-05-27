-- ============================================================
-- Migration 003: Review & Report Schema
-- ============================================================

-- reviews (사후 평가)
CREATE TABLE IF NOT EXISTS reviews (
  id             SERIAL  PRIMARY KEY,
  match_id       UUID    NOT NULL REFERENCES matches(id),
  reviewer_id    UUID    NOT NULL REFERENCES users(id),
  reviewee_id    UUID    NOT NULL REFERENCES users(id),
  sportsmanship  BOOLEAN,
  punctuality    BOOLEAN,
  rematch_score  INTEGER CHECK (rematch_score >= 1 AND rematch_score <= 5),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, reviewer_id, reviewee_id),
  CHECK (reviewer_id <> reviewee_id)
);

-- fraud_reports (부정 실력자 신고)
CREATE TABLE IF NOT EXISTS fraud_reports (
  id           SERIAL  PRIMARY KEY,
  match_id     UUID    NOT NULL REFERENCES matches(id),
  reporter_id  UUID    NOT NULL REFERENCES users(id),
  reported_id  UUID    NOT NULL REFERENCES users(id),
  fraud_type   TEXT    NOT NULL CHECK (fraud_type IN ('tier_too_high', 'tier_too_low')),
  trust_weight NUMERIC(3,2),
  status       TEXT    NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','under_review','upheld','dismissed')),
  admin_note   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, reporter_id, reported_id),
  CHECK (reporter_id <> reported_id)
);

-- tier_audit_log (티어 변경 이력)
CREATE TABLE IF NOT EXISTS tier_audit_log (
  id             SERIAL  PRIMARY KEY,
  user_id        UUID    NOT NULL REFERENCES users(id),
  sport_id       INTEGER NOT NULL REFERENCES sport_categories(id),
  old_tier_score INTEGER NOT NULL,
  new_tier_score INTEGER NOT NULL,
  reason         TEXT    NOT NULL,
  triggered_by   UUID    REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_fraud_reports_reported_id ON fraud_reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_status ON fraud_reports(status);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_created_at ON fraud_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_tier_audit_log_user_id ON tier_audit_log(user_id);

CREATE OR REPLACE TRIGGER update_fraud_reports_updated_at
  BEFORE UPDATE ON fraud_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
