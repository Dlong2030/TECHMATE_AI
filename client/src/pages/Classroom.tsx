import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import api from '../services/api'
import { getErrorMessage } from '../utils/error'
import type { Character, Session, Message } from '../types'
import '../styles/classroom.css'

const Classroom = () => {
    const { characterId } = useParams<{ characterId: string }>()
    const { teacher } = useAuth()
    const navigate = useNavigate()

    const [character, setCharacter] = useState<Character | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [isTalking, setIsTalking] = useState(false)
    const [error, setError] = useState('')
    const [showStartModal, setShowStartModal] = useState(true)
    const [className, setClassName] = useState('')
    const [grade, setGrade] = useState('Lớp 3')

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const streamBufferRef = useRef('')

    // ─── Scroll to bottom ────────────────────────────────────────────────────────

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => { scrollToBottom() }, [messages])

    // ─── Load character ──────────────────────────────────────────────────────────

    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const res = await api.get(`/characters/${characterId}`)
                setCharacter(res.data.data)
            } catch (err) {
                setError(getErrorMessage(err))
            } finally {
                setLoading(false)
            }
        }
        if (characterId) fetchCharacter()
    }, [characterId])

    // ─── Start session ───────────────────────────────────────────────────────────

    const handleStartSession = async () => {
        if (!className.trim() || !character) return
        try {
            const res = await api.post('/sessions', {
                characterId: character._id,
                className,
                subject: character.subject,
                grade,
            })
            setSession(res.data.data)
            setShowStartModal(false)

            // Tin nhắn chào mở đầu
            setMessages([{
                _id: 'welcome',
                sessionId: res.data.data._id,
                role: 'assistant',
                content: `Roarrr! Chào các bạn lớp ${className}! ${character.name} đã sẵn sàng rồi đây! Hôm nay chúng ta cùng khám phá ${character.subject} nhé! 🎉`,
                createdAt: new Date().toISOString(),
            }])

            setTimeout(() => inputRef.current?.focus(), 100)
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    // ─── Send message với streaming ──────────────────────────────────────────────

    const handleSend = async () => {
        if (!input.trim() || !session || sending) return

        const userMessage: Message = {
            _id: `user-${Date.now()}`,
            sessionId: session._id,
            role: 'user',
            content: input.trim(),
            createdAt: new Date().toISOString(),
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setSending(true)
        setIsTalking(true)
        streamBufferRef.current = ''

        // Thêm placeholder cho AI response
        const aiId = `ai-${Date.now()}`
        setMessages(prev => [...prev, {
            _id: aiId,
            sessionId: session._id,
            role: 'assistant',
            content: '',
            createdAt: new Date().toISOString(),
        }])

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/chat/send`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({
                        sessionId: session._id,
                        characterId: character?._id,
                        content: userMessage.content,
                        provider: 'gemini',
                    }),
                }
            )

            if (!res.body) throw new Error('No stream')

            const reader = res.body.getReader()
            const decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const text = decoder.decode(value)
                const lines = text.split('\n')

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue
                    try {
                        const json = JSON.parse(line.slice(6))
                        if (json.chunk) {
                            streamBufferRef.current += json.chunk
                            const current = streamBufferRef.current
                            setMessages(prev =>
                                prev.map(m => m._id === aiId ? { ...m, content: current } : m)
                            )
                        }
                        if (json.done || json.error) {
                            setIsTalking(false)
                            setSending(false)
                        }
                    } catch { /* skip malformed */ }
                }
            }
        } catch (err) {
            setError(getErrorMessage(err))
            setMessages(prev => prev.filter(m => m._id !== aiId))
            setIsTalking(false)
            setSending(false)
        }
    }

    // ─── Key handler ─────────────────────────────────────────────────────────────

    const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
        e.target.style.height = 'auto'
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
    }

    // ─── End session ─────────────────────────────────────────────────────────────

    const handleEndSession = async () => {
        if (!session) { navigate('/dashboard'); return }
        if (!confirm('Kết thúc buổi học?')) return
        navigate('/dashboard')
    }

    const getInitials = (name: string) =>
        name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()

    // ─── Loading ─────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="cls-loading">
                <div className="cls-spinner" />
                <p>Đang chuẩn bị lớp học...</p>
            </div>
        )
    }

    return (
        <div className="classroom">

            {/* ── Start modal ── */}
            {showStartModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-avatar">{character?.avatarUrl || '🤖'}</div>
                        <h2 className="modal-title">Bắt đầu với {character?.name}</h2>
                        <p className="modal-sub">{character?.subject} · {character?.grade}</p>

                        {error && <div className="modal-error">{error}</div>}

                        <div className="modal-field">
                            <label>Tên lớp</label>
                            <input
                                type="text"
                                placeholder="VD: 3A, 4B..."
                                value={className}
                                onChange={e => setClassName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleStartSession()}
                                autoFocus
                            />
                        </div>

                        <div className="modal-field">
                            <label>Khối lớp</label>
                            <select value={grade} onChange={e => setGrade(e.target.value)}>
                                {['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5'].map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button className="modal-cancel" onClick={() => navigate('/dashboard')}>
                                Huỷ
                            </button>
                            <button
                                className="modal-start"
                                onClick={handleStartSession}
                                disabled={!className.trim()}
                            >
                                Bắt đầu buổi học →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Topbar ── */}
            <div className="cls-topbar">
                <div className="cls-left">
                    <button className="back-btn" onClick={() => navigate('/dashboard')}>
                        ← Dashboard
                    </button>
                    <div className="cls-char-info">
                        <div className="cls-char-avatar">🤖</div>
                        <div>
                            <div className="cls-char-name">{character?.name}</div>
                            <div className="cls-char-sub">TechMate AI</div>
                        </div>
                    </div>
                </div>
                <div className="cls-right">
                    {session && (
                        <span className="cls-badge">
                            📡 Lớp {session.className} · {character?.subject}
                        </span>
                    )}
                    <button className="end-btn" onClick={handleEndSession}>
                        Kết thúc
                    </button>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="cls-body">

                {/* Character panel */}
                <div className="char-panel">
                    <div className={`big-avatar ${isTalking ? 'talking' : ''}`}>
                        {character?.avatarUrl || '🤖'}
                    </div>
                    <div className="char-panel-name">{character?.name}</div>
                    <div className="char-panel-sub">{character?.personality}</div>
                    <div className="subject-pill">{character?.subject}</div>
                </div>

                {/* Chat area */}
                <div className="chat-area">
                    <div className="messages">
                        {messages.map(msg => (
                            <div key={msg._id} className={`msg ${msg.role}`}>
                                <div className={`msg-avatar ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
                                    {msg.role === 'assistant'
                                        ? (character?.avatarUrl || '🤖')
                                        : getInitials(teacher?.name || 'GV')}
                                </div>
                                <div className="msg-bubble">
                                    {msg.content || (
                                        <div className="typing">
                                            <span /><span /><span />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {error && (
                        <div className="cls-error">{error}</div>
                    )}

                    <div className="input-area">
                        <div className="input-row">
                            <textarea
                                ref={inputRef}
                                className="input-box"
                                placeholder="Nhập câu trả lời của học sinh hoặc câu hỏi..."
                                rows={1}
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={handleKey}
                                disabled={sending || !session}
                            />
                            <button
                                className="send-btn"
                                onClick={handleSend}
                                disabled={sending || !input.trim() || !session}
                            >
                                ➤
                            </button>
                        </div>
                        <div className="input-hint">Enter để gửi · Shift+Enter để xuống dòng</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Classroom