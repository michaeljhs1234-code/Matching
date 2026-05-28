-- ============================================================
-- Migration 005: Remove 회계학과 + Add match messages system
-- ============================================================

-- 1. 경영대학 회계학과 삭제 (이미 가입된 유저 참조 없을 경우)
DELETE FROM departments
WHERE college = '경영대학' AND name = '회계학과';

-- 2. 매치 쪽지(메시지) 테이블 생성
CREATE TABLE IF NOT EXISTS match_messages (
  id          BIGSERIAL PRIMARY KEY,
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_match_messages_match_id
  ON match_messages(match_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_match_messages_sender_id
  ON match_messages(sender_id);

-- 3. RLS 설정
ALTER TABLE match_messages ENABLE ROW LEVEL SECURITY;

-- 읽기: 해당 매치 참가자만 조회 가능
CREATE POLICY "match_messages_select"
  ON match_messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM match_participants WHERE match_id = match_messages.match_id
    )
    OR
    auth.uid() IN (
      SELECT host_user_id FROM matches WHERE id = match_messages.match_id
    )
  );

-- 쓰기: 해당 매치 참가자 또는 호스트만 작성 가능
CREATE POLICY "match_messages_insert"
  ON match_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      auth.uid() IN (
        SELECT user_id FROM match_participants WHERE match_id = match_messages.match_id
      )
      OR
      auth.uid() IN (
        SELECT host_user_id FROM matches WHERE id = match_messages.match_id
      )
    )
  );

-- 삭제(soft delete): 본인 메시지만 삭제 가능
CREATE POLICY "match_messages_update"
  ON match_messages FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);
