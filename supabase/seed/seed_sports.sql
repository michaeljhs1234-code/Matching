-- ============================================================
-- Seed: 스포츠 종목 (5개)
-- ============================================================

INSERT INTO sport_categories (name, icon, team_size) VALUES
('축구',    'soccer',     11),
('풋살',    'futsal',      5),
('농구',    'basketball',  5),
('볼링',    'bowling',     4),
('e스포츠', 'esports',     5)
ON CONFLICT (name) DO NOTHING;
