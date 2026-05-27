-- ============================================================
-- Migration 004: RLS Policies
-- ============================================================

-- ── departments ───────────────────────────────────────────────
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "departments_select_all" ON departments FOR SELECT USING (true);

-- ── users ─────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_all"  ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_own"  ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own"  ON users FOR UPDATE USING (auth.uid() = id);

-- ── sport_categories ─────────────────────────────────────────
ALTER TABLE sport_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sport_categories_select_all" ON sport_categories FOR SELECT USING (true);

-- ── user_sport_tiers ─────────────────────────────────────────
ALTER TABLE user_sport_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tiers_select_all"  ON user_sport_tiers FOR SELECT USING (true);
CREATE POLICY "tiers_insert_own"  ON user_sport_tiers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tiers_update_own"  ON user_sport_tiers FOR UPDATE USING (auth.uid() = user_id AND is_locked = false);

-- ── matches ───────────────────────────────────────────────────
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches_select_all"   ON matches FOR SELECT USING (true);
CREATE POLICY "matches_insert_auth"  ON matches FOR INSERT WITH CHECK (auth.uid() = host_user_id);
CREATE POLICY "matches_update_host"  ON matches FOR UPDATE USING (auth.uid() = host_user_id);

-- ── groups ────────────────────────────────────────────────────
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "groups_select_all"   ON groups FOR SELECT USING (true);
CREATE POLICY "groups_insert_auth"  ON groups FOR INSERT WITH CHECK (auth.uid() = host_user_id);
CREATE POLICY "groups_update_host"  ON groups FOR UPDATE USING (auth.uid() = host_user_id);

-- ── group_members ─────────────────────────────────────────────
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gm_select_all"  ON group_members FOR SELECT USING (true);
CREATE POLICY "gm_insert_own"  ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "gm_delete_own"  ON group_members FOR DELETE USING (auth.uid() = user_id);

-- ── match_participants ────────────────────────────────────────
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mp_select_all"   ON match_participants FOR SELECT USING (true);
CREATE POLICY "mp_insert_own"   ON match_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mp_delete_own"   ON match_participants FOR DELETE USING (auth.uid() = user_id);

-- ── reviews ───────────────────────────────────────────────────
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_participant" ON reviews FOR SELECT
  USING (
    reviewer_id = auth.uid() OR
    reviewee_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "reviews_insert_participant" ON reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM match_participants
      WHERE match_id = reviews.match_id AND user_id = auth.uid()
    )
  );

-- ── fraud_reports ─────────────────────────────────────────────
ALTER TABLE fraud_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fr_select_reporter_or_admin" ON fraud_reports FOR SELECT
  USING (
    reporter_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "fr_insert_participant" ON fraud_reports FOR INSERT
  WITH CHECK (
    reporter_id = auth.uid() AND
    reporter_id <> reported_id AND
    EXISTS (
      SELECT 1 FROM match_participants
      WHERE match_id = fraud_reports.match_id AND user_id = auth.uid()
    )
  );

-- ── tier_audit_log ────────────────────────────────────────────
ALTER TABLE tier_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_select_own_or_admin" ON tier_audit_log FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
