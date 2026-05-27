-- ============================================================
-- Migration 001: Initial Schema
-- ============================================================

-- departments (학과 목록)
CREATE TABLE IF NOT EXISTS departments (
  id         SERIAL PRIMARY KEY,
  college    TEXT NOT NULL,
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- users (사용자)
CREATE TABLE IF NOT EXISTS users (
  id                  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                TEXT        NOT NULL,
  student_id          VARCHAR(10) NOT NULL UNIQUE,
  department_id       INTEGER     REFERENCES departments(id),
  email               TEXT        NOT NULL UNIQUE,
  email_verified      BOOLEAN     NOT NULL DEFAULT false,
  manner_temperature  NUMERIC(4,1) NOT NULL DEFAULT 36.5 CHECK (manner_temperature >= 0 AND manner_temperature <= 100),
  role                TEXT        NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  is_active           BOOLEAN     NOT NULL DEFAULT true,
  suspended_until     TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- sport_categories (스포츠 종목)
CREATE TABLE IF NOT EXISTS sport_categories (
  id         SERIAL  PRIMARY KEY,
  name       TEXT    NOT NULL UNIQUE,
  icon       TEXT,
  team_size  INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_sport_tiers (유저별 종목 티어)
CREATE TABLE IF NOT EXISTS user_sport_tiers (
  id           SERIAL   PRIMARY KEY,
  user_id      UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sport_id     INTEGER  NOT NULL REFERENCES sport_categories(id),
  tier_name    TEXT     NOT NULL CHECK (tier_name IN (
                 'rookie',
                 'amateur_1','amateur_2','amateur_3','amateur_4','amateur_5',
                 'semipro_1','semipro_2','semipro_3',
                 'pro'
               )),
  tier_score   INTEGER  NOT NULL CHECK (tier_score >= 0 AND tier_score <= 100),
  is_locked    BOOLEAN  NOT NULL DEFAULT false,
  locked_until TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, sport_id)
);

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_user_sport_tiers_updated_at
  BEFORE UPDATE ON user_sport_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
