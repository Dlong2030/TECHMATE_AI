import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api'
import '../styles/auth.css'

type Step = 'email' | 'otp' | 'info' | 'success'

const STEPS: Step[] = ['email', 'otp', 'info']

const stepIndex = (s: Step) => STEPS.indexOf(s)

const Register = () => {
    const navigate = useNavigate()

    // ─── State ──────────────────────────────────────────────────────────────────

    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [name, setName] = useState('')
    const [school, setSchool] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(300)

    const otpRefs = useRef<(HTMLInputElement | null)[]>([])
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // ─── Countdown ──────────────────────────────────────────────────────────────

    const startTimer = () => {
        clearInterval(timerRef.current!)
        setCountdown(300)
        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearInterval(timerRef.current!); return 0 }
                return prev - 1
            })
        }, 1000)
    }

    useEffect(() => () => clearInterval(timerRef.current!), [])

    const fmtTime = (s: number) =>
        `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

    // ─── Header config per step ─────────────────────────────────────────────────

    const headerMap = {
        email: { title: 'Tạo tài khoản', sub: 'Bước 1: Nhập email để xác thực' },
        otp: { title: 'Kiểm tra email', sub: 'Bước 2: Nhập mã 6 số' },
        info: { title: 'Thông tin của bạn', sub: 'Bước 3: Hoàn tất đăng ký' },
        success: { title: 'Hoàn tất! 🎉', sub: 'Tài khoản đã được tạo thành công' },
    }

    // ─── Step 1: Send OTP ────────────────────────────────────────────────────────

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.includes('@')) {
            setErrors({ email: 'Vui lòng nhập email hợp lệ' }); return
        }
        setErrors({})
        setLoading(true)
        try {
            await authApi.sendOtp(email)
            setStep('otp')
            startTimer()
            setTimeout(() => otpRefs.current[0]?.focus(), 100)
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setErrors({ email: error.response?.data?.message || 'Không thể gửi email. Thử lại sau.' })
        } finally {
            setLoading(false)
        }
    }

    // ─── Step 2: Verify OTP ──────────────────────────────────────────────────────

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        const code = otp.join('')
        if (code.length < 6) {
            setErrors({ otp: 'Vui lòng nhập đủ 6 số' }); return
        }
        setErrors({})
        setLoading(true)
        try {
            await authApi.verifyOtp(email, code)
            clearInterval(timerRef.current!)
            setStep('info')
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setErrors({ otp: error.response?.data?.message || 'Mã xác nhận không đúng hoặc đã hết hạn' })
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setOtp(['', '', '', '', '', ''])
        setErrors({})
        try {
            await authApi.sendOtp(email)
            startTimer()
            setTimeout(() => otpRefs.current[0]?.focus(), 100)
        } catch { /* silent */ }
    }

    // ─── OTP input helpers ───────────────────────────────────────────────────────

    const handleOtpChange = (i: number, val: string) => {
        const v = val.replace(/\D/g, '').slice(-1)
        const next = [...otp]
        next[i] = v
        setOtp(next)
        if (v && i < 5) otpRefs.current[i + 1]?.focus()
    }

    const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) {
            otpRefs.current[i - 1]?.focus()
        }
    }

    // ─── Step 3: Register ────────────────────────────────────────────────────────

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        const err: Record<string, string> = {}
        if (!name.trim()) err.name = 'Vui lòng nhập họ tên'
        if (!school.trim()) err.school = 'Vui lòng nhập tên trường'
        if (password.length < 6) err.password = 'Mật khẩu tối thiểu 6 ký tự'
        if (Object.keys(err).length) { setErrors(err); return }
        setErrors({})
        setLoading(true)
        try {
            await authApi.register({ name, email, password, school })
            setStep('success')
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setErrors({ global: error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.' })
        } finally {
            setLoading(false)
        }
    }

    const { title, sub } = headerMap[step]
    const showSteps = step !== 'success'

    return (
        <div className="auth-page">
            {/* Background */}
            <div className="bg-icons" aria-hidden>
                {['📚', '⭐', '✏️', '📐', '🎨', '📝', '🌟', '🔢', '🎯', '📖'].map((ic, i) => (
                    <span key={i} className={`ico ico-${i + 1}`}>{ic}</span>
                ))}
            </div>
            <div className="blob blob-1" />
            <div className="blob blob-2" />

            <div className="card-wrap">
                <div className="card">

                    {/* Header */}
                    <div className="card-header">
                        <div className="logo-row">
                            <div className="logo-badge">🐉</div>
                            <span className="logo-name">Classroom AI</span>
                        </div>
                        <h1 className="header-title">{title}</h1>
                        <p className="header-sub">{sub}</p>

                        {showSteps && (
                            <div className="steps">
                                {STEPS.map((s, i) => (
                                    <div
                                        key={s}
                                        className={`sdot ${i === stepIndex(step) ? 'on' :
                                            i < stepIndex(step) ? 'done' : ''
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Body */}
                    <div className="card-body">

                        {/* ── Step 1: Email ── */}
                        {step === 'email' && (
                            <form onSubmit={handleSendOtp} noValidate>
                                <div className="field" style={{ marginBottom: '22px' }}>
                                    <label className="flabel">Email của bạn</label>
                                    <input
                                        className={`finput ${errors.email ? 'err' : ''}`}
                                        type="email"
                                        placeholder="giaovien@truong.edu.vn"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        autoFocus
                                    />
                                    {errors.email && <p className="ferr">{errors.email}</p>}
                                </div>
                                <button className="btn btn-main" type="submit" disabled={loading}>
                                    {loading ? <><span className="spin" />Đang gửi...</> : 'Gửi mã xác nhận ✉️'}
                                </button>
                                <p className="switch-link">
                                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                                </p>
                            </form>
                        )}

                        {/* ── Step 2: OTP ── */}
                        {step === 'otp' && (
                            <form onSubmit={handleVerifyOtp} noValidate>
                                <div className="otp-hint">
                                    Mã xác nhận đã gửi đến<br />
                                    <b>{email}</b>
                                </div>

                                <div className="otp-row">
                                    {otp.map((v, i) => (
                                        <input
                                            key={i}
                                            ref={el => { otpRefs.current[i] = el }}
                                            className={`oinput ${v ? 'filled' : ''}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={v}
                                            onChange={e => handleOtpChange(i, e.target.value)}
                                            onKeyDown={e => handleOtpKey(i, e)}
                                        />
                                    ))}
                                </div>

                                {errors.otp && <p className="ferr" style={{ textAlign: 'center', marginTop: '10px' }}>{errors.otp}</p>}

                                <div style={{ marginTop: '20px' }}>
                                    <button className="btn btn-main" type="submit" disabled={loading}>
                                        {loading ? <><span className="spin" />Đang xác nhận...</> : 'Xác nhận mã →'}
                                    </button>
                                </div>

                                <div className="timer-row">
                                    <span className="timer-txt">Hết hạn sau <b>{fmtTime(countdown)}</b></span>
                                    <button type="button" className="btn btn-ghost" onClick={handleResend}>
                                        Gửi lại mã
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── Step 3: Info ── */}
                        {step === 'info' && (
                            <form onSubmit={handleRegister} noValidate>
                                {errors.global && <div className="gerr">{errors.global}</div>}

                                <div className="field">
                                    <label className="flabel">Họ và tên</label>
                                    <input
                                        className={`finput ${errors.name ? 'err' : ''}`}
                                        type="text"
                                        placeholder="Nguyễn Thị Lan"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        autoFocus
                                    />
                                    {errors.name && <p className="ferr">{errors.name}</p>}
                                </div>

                                <div className="field">
                                    <label className="flabel">Tên trường</label>
                                    <input
                                        className={`finput ${errors.school ? 'err' : ''}`}
                                        type="text"
                                        placeholder="Tiểu học Nguyễn Du"
                                        value={school}
                                        onChange={e => setSchool(e.target.value)}
                                    />
                                    {errors.school && <p className="ferr">{errors.school}</p>}
                                </div>

                                <div className="field" style={{ marginBottom: '22px' }}>
                                    <label className="flabel">Mật khẩu</label>
                                    <input
                                        className={`finput ${errors.password ? 'err' : ''}`}
                                        type="password"
                                        placeholder="Tối thiểu 6 ký tự"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                    {errors.password && <p className="ferr">{errors.password}</p>}
                                </div>

                                <button className="btn btn-main" type="submit" disabled={loading}>
                                    {loading ? <><span className="spin" />Đang tạo tài khoản...</> : 'Tạo tài khoản 🎉'}
                                </button>
                            </form>
                        )}

                        {/* ── Success ── */}
                        {step === 'success' && (
                            <div className="success-wrap">
                                <span className="sicon">🎊</span>
                                <h2 className="stitle">Đăng ký thành công!</h2>
                                <p className="ssub">
                                    Chào mừng bạn đến với Classroom AI.<br />
                                    Hãy bắt đầu tạo nhân vật và<br />
                                    mang phép màu vào lớp học nhé!
                                </p>
                                <button className="btn btn-main" onClick={() => navigate('/login')}>
                                    Đăng nhập ngay →
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register