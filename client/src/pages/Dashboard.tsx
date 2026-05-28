import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { getErrorMessage } from '../utils/error'
import api from '../services/api'
import type { Character, Session } from '../types'
import '../styles/dashboard.css'

const Dashboard = () => {
    const { teacher, logout } = useAuth()
    const navigate = useNavigate()

    const [characters, setCharacters] = useState<Character[]>([])
    const [sessions, setSessions] = useState<Session[]>([])
    const [totalMessages, setTotalMessages] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // ─── Load data ─────────────────────────────────────────────────────────────

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [charRes, sessRes] = await Promise.all([
                    api.get('/characters'),
                    api.get('/sessions'),
                ])
                const chars: Character[] = charRes.data.data
                const sess: Session[] = sessRes.data.data
                setCharacters(chars)
                setSessions(sess)
                setTotalMessages(sess.reduce((acc, s) => acc + s.totalMessages, 0))
            } catch (err) {
                setError(getErrorMessage(err))
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // ─── Handlers ──────────────────────────────────────────────────────────────

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const handleEnterClass = (characterId: string) => {
        navigate(`/classroom/${characterId}`)
    }

    const getGreeting = () => {
        const h = new Date().getHours()
        if (h < 12) return 'Chào buổi sáng'
        if (h < 18) return 'Chào buổi chiều'
        return 'Chào buổi tối'
    }

    const getInitials = (name: string) =>
        name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()

    const fmtDate = (iso: string) => {
        const d = new Date(iso)
        const now = new Date()
        const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
        if (diff === 0) return `Hôm nay, ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
        if (diff === 1) return `Hôm qua, ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
        return `${diff} ngày trước`
    }

    const subjectColor = (subject: string) => {
        const map: Record<string, string> = {
            'Toán': 'orange',
            'Tiếng Việt': 'amber',
            'Tự nhiên xã hội': 'green',
            'Khoa học': 'green',
            'Đạo đức': 'purple',
            'Khác': 'gray',
        }
        return map[subject] || 'gray'
    }

    // ─── Render ────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="db-loading">
                <div className="db-spinner" />
                <p>Đang tải...</p>
            </div>
        )
    }

    return (
        <div className="db">

            {/* ── Topbar ── */}
            <div className="topbar">
                <div className="topbar-left">
                    <div className="logo-b">🤖</div>
                    <span className="logo-n">TechMate AI</span>
                </div>
                <div className="topbar-right">
                    {teacher && (
                        <div className="teacher-info">
                            <div className="teacher-name">{teacher.name}</div>
                            <div className="teacher-school">{teacher.school}</div>
                        </div>
                    )}
                    <div className="avatar">{teacher ? getInitials(teacher.name) : 'GV'}</div>
                    <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="content">

                {/* Welcome */}
                <div className="welcome">
                    <h1>{getGreeting()}, {teacher?.name.split(' ').pop()}! ☀️</h1>
                    <p>Hôm nay bạn muốn dạy cùng nhân vật nào?</p>
                </div>

                {/* Error */}
                {error && <div className="db-error">{error}</div>}

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon orange">🤖</div>
                        <div className="stat-num">{characters.length}</div>
                        <div className="stat-label">Nhân vật đang hoạt động</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon amber">📚</div>
                        <div className="stat-num">{sessions.length}</div>
                        <div className="stat-label">Buổi học đã tạo</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green">💬</div>
                        <div className="stat-num">{totalMessages}</div>
                        <div className="stat-label">Lượt tương tác</div>
                    </div>
                </div>

                {/* Characters */}
                <div className="section-header">
                    <span className="section-title">Nhân vật của tôi</span>
                    <button className="add-btn" onClick={() => navigate('/characters/new')}>
                        + Thêm nhân vật
                    </button>
                </div>

                {characters.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">🤖</span>
                        <p>Bạn chưa có nhân vật nào. Hãy tạo nhân vật đầu tiên!</p>
                        <button className="add-btn" onClick={() => navigate('/characters/new')}>
                            + Tạo nhân vật
                        </button>
                    </div>
                ) : (
                    <div className="char-grid">
                        {characters.map(char => (
                            <div key={char._id} className="char-card">
                                <div className={`char-avatar bg-${subjectColor(char.subject)}`}>
                                    {char.avatarUrl ? (
                                        <img src={char.avatarUrl} alt={char.name} />
                                    ) : '🤖'}
                                </div>
                                <div className="char-name">{char.name}</div>
                                <div className="char-subject">{char.subject} · {char.grade}</div>
                                <span className={`char-tag ${subjectColor(char.subject)}`}>
                                    {char.subject}
                                </span>
                                <button
                                    className="enter-btn"
                                    onClick={() => handleEnterClass(char._id)}
                                >
                                    Vào lớp học →
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Recent Sessions */}
                <div className="section-header" style={{ marginTop: '24px' }}>
                    <span className="section-title">Buổi học gần đây</span>
                </div>

                {sessions.length === 0 ? (
                    <div className="empty-state small">
                        <p>Chưa có buổi học nào. Vào lớp học để bắt đầu!</p>
                    </div>
                ) : (
                    <div className="sessions-list">
                        {sessions.slice(0, 5).map(sess => (
                            <div key={sess._id} className="session-row">
                                <div className={`sess-avatar bg-${subjectColor(sess.subject)}`}>
                                    🤖
                                </div>
                                <div className="sess-info">
                                    <div className="sess-name">
                                        {typeof sess.characterId === 'object'
                                            ? sess.characterId.name
                                            : ''} · Lớp {sess.className}
                                    </div>
                                    <div className="sess-meta">{sess.subject} · {fmtDate(sess.createdAt)}</div>
                                </div>
                                <div className="sess-count">
                                    <b>{sess.totalMessages}</b> lượt tương tác
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}

export default Dashboard