-- ============================================================
-- Migration 002: Matching Schema
-- ============================================================

-- matches (매칭 방)
CREATE TABLE IF NOT EXISTS matches (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id         INTEGER NOT NULL REFERENCES sport_categories(id),
  title            TEXT    NOT NULL,
  location         TEXT,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  max_participants INTEGER NOT NULL CHECK (max_participants > 0 AND max_participants % 2 = 0),
  status           TEXT    NOT NULL DEFAULT 'OPEN'
                     CHECK (status IN (
                       'OPEN','FULL','BALANCING','CONFIRMED',
                       'IN_PROGRESS','COMPLETED','REVIEWED','CANCELLED'
                     )),
  host_user_id     UUID    NOT NULL REFERENCES users(id),
  team_a_score     INTEGER,
  team_b_score     INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- groups (그룹)
CREATE TABLE IF NOT EXISTS groups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  host_user_id UUID NOT NULL REFERENCES users(id),
  invite_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- group_members (그룹 멤버십)
CREATE TABLE IF NOT EXISTS group_members (
  id        SERIAL PRIMARY KEY,
  group_id  UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

-- match_participants (매칭 참가자 및 팀 배정)
CREATE TABLE IF NOT EXISTS match_participants (
  id            SERIAL PRIMARY KEY,
  match_id      UUID    NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id       UUID    NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  group_id      UUID    REFERENCES groups(id),
  team          TEXT    CHECK (team IN ('A', 'B')),
  tier_snapshot INTEGER NOT NULL,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, user_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_scheduled_at ON matches(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_matches_sport_id ON matches(sport_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_match_id ON match_participants(match_id);
CREATE INDEX IF NOT EXISTS idx_match_participants_user_id ON match_participants(user_id);

-- 트리거
CREATE OR REPLACE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_match_participants_updated_at
  BEFORE UPDATE ON match_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
