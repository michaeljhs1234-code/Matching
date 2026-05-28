'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Trash2, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: number
  sender_id: string
  content: string
  is_deleted: boolean
  created_at: string
  users?: { name: string }
}

interface Props {
  matchId: string
  currentUserId: string
  currentUserName: string
}

export default function MatchChat({ matchId, currentUserId, currentUserName }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // 메시지 조회
  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('match_messages')
      .select('id, sender_id, content, is_deleted, created_at, users(name)')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true })
      .limit(200)

    if (data) {
      setMessages(data as unknown as Message[])
    }
    setLoading(false)
  }, [matchId, supabase])

  useEffect(() => {
    fetchMessages()

    // Realtime 구독
    const channel = supabase
      .channel(`match-chat-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_messages',
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          fetchMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchMessages, matchId, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || sending) return

    setSending(true)
    setInput('')

    const { error } = await supabase.from('match_messages').insert({
      match_id: matchId,
      sender_id: currentUserId,
      content: trimmed,
    })

    if (error) {
      console.error('메시지 전송 실패:', error)
      setInput(trimmed)
    }

    setSending(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleDelete = async (msgId: number) => {
    await supabase
      .from('match_messages')
      .update({ is_deleted: true })
      .eq('id', msgId)
      .eq('sender_id', currentUserId)
    fetchMessages()
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
  }

  // 날짜 구분선 계산
  const getDateLabel = (msg: Message, prevMsg: Message | undefined) => {
    const date = new Date(msg.created_at).toDateString()
    const prevDate = prevMsg ? new Date(prevMsg.created_at).toDateString() : null
    return date !== prevDate ? formatDate(msg.created_at) : null
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <MessageCircle className="w-5 h-5 text-indigo-400" />
        <h3 className="font-bold text-white text-sm">매치 채팅</h3>
        <span className="ml-auto text-xs text-slate-500">참가자 전용</span>
      </div>

      {/* 메시지 목록 */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
        style={{ minHeight: 0 }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            불러오는 중...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500">
            <MessageCircle className="w-10 h-10 opacity-30" />
            <p className="text-sm">아직 메시지가 없습니다.</p>
            <p className="text-xs opacity-60">먼저 인사를 건네보세요! 👋</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.sender_id === currentUserId
            const dateLabel = getDateLabel(msg, messages[idx - 1])
            const senderName = (msg as any).users?.name ?? '알 수 없음'

            return (
              <div key={msg.id}>
                {/* 날짜 구분선 */}
                {dateLabel && (
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-xs text-slate-500 px-2">{dateLabel}</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                )}

                <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* 아바타 */}
                  {!isMine && (
                    <div
                      className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        background: `hsl(${(senderName.charCodeAt(0) * 37) % 360}, 60%, 45%)`,
                      }}
                    >
                      {senderName[0]}
                    </div>
                  )}

                  <div className={`flex flex-col gap-0.5 max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                    {/* 발신자 이름 (상대방만) */}
                    {!isMine && !msg.is_deleted && (
                      <span className="text-xs text-slate-400 px-1">{senderName}</span>
                    )}

                    {msg.is_deleted ? (
                      <div className="px-3 py-2 rounded-2xl text-xs text-slate-600 italic"
                        style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        삭제된 메시지입니다
                      </div>
                    ) : (
                      <div className={`group relative flex items-end gap-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                        <div
                          className="px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words"
                          style={
                            isMine
                              ? {
                                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                  color: '#fff',
                                  borderBottomRightRadius: '4px',
                                }
                              : {
                                  background: 'rgba(30,41,59,0.8)',
                                  border: '1px solid rgba(255,255,255,0.06)',
                                  color: '#e2e8f0',
                                  borderBottomLeftRadius: '4px',
                                }
                          }
                        >
                          {msg.content}
                        </div>

                        {/* 삭제 버튼 (본인만) */}
                        {isMine && (
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}

                        <span className="text-[10px] text-slate-600 mb-0.5 flex-shrink-0">
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="px-4 py-3 border-t border-white/5">
        <div
          className="flex items-end gap-2 rounded-2xl px-3 py-2"
          style={{ background: 'rgba(15,15,26,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              // 자동 높이 조정
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요… (Enter 전송, Shift+Enter 줄바꿈)"
            rows={1}
            maxLength={500}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none outline-none py-1 leading-relaxed"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
            style={{
              background: input.trim() ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(30,41,59,0.5)',
            }}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-right text-[10px] text-slate-600 mt-1 pr-1">{input.length}/500</p>
      </div>
    </div>
  )
}
