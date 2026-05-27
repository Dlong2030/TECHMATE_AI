import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api'
import { getErrorMessage } from '../utils/error'
import '../styles/auth.css'

const Login = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState<{ email?: string; password?: string; global?: string }>({})
    const [loading, setLoading] = useState(false)

    // ─── Validate ───────────────────────────────────────────────────────────────

    const validate = () => {
        const err: typeof errors = {}
        if (!email.includes('@')) err.email = 'Vui lòng nhập email hợp lệ'
        if (!password) err.password = 'Vui lòng nhập mật khẩu'
        setErrors(err)
        return Object.keys(err).length === 0
    }

    // ─── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        setLoading(true)
        setErrors({})
        try {
            const res = await authApi.login(email, password)
            const { token, data } = res.data
            localStorage.setItem('token', token)
            localStorage.setItem('teacher', JSON.stringify(data))
            navigate('/dashboard')
        } catch (err) {
            setErrors({ global: getErrorMessage(err, 'Email hoặc mật khẩu không đúng') })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            {/* Background icons */}
            <div className="bg-icons" aria-hidden>
                {['📚', '⭐', '✏️', '📐', '🎨', '📝', '🌟', '🔢', '🎯', '📖'].map((ic, i) => (
                    <span key={i} className={`ico ico-${i + 1}`}>{ic}</span>
                ))}
            </div>
            <div className="blob blob-1" />
            <div className="blob blob-2" />

            {/* Card */}
            <div className="card-wrap">
                <div className="card">

                    {/* Header */}
                    <div className="card-header">
                        <div className="logo-row">
                            <div className="logo-badge">🐉</div>
                            <span className="logo-name">TechMate AI</span>
                        </div>
                        <h1 className="header-title">Chào mừng trở lại!</h1>
                        <p className="header-sub">Đăng nhập để tiếp tục hành trình giảng dạy</p>
                    </div>

                    {/* Body */}
                    <div className="card-body">
                        <form onSubmit={handleSubmit} noValidate>

                            {/* Global error */}
                            {errors.global && (
                                <div className="gerr">{errors.global}</div>
                            )}

                            {/* Email */}
                            <div className="field">
                                <label className="flabel">Email</label>
                                <input
                                    className={`finput ${errors.email ? 'err' : ''}`}
                                    type="email"
                                    placeholder="giaovien@truong.edu.vn"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    autoComplete="email"
                                />
                                {errors.email && <p className="ferr">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div className="field" style={{ marginBottom: '22px' }}>
                                <label className="flabel">Mật khẩu</label>
                                <input
                                    className={`finput ${errors.password ? 'err' : ''}`}
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                {errors.password && <p className="ferr">{errors.password}</p>}
                            </div>

                            <button className="btn btn-main" type="submit" disabled={loading}>
                                {loading ? <><span className="spin" />Đang đăng nhập...</> : 'Đăng nhập'}
                            </button>
                        </form>

                        <p className="switch-link">
                            Chưa có tài khoản? <Link to="/register">Đăng ký ngay →</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login