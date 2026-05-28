import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Teacher } from '../types'
import AuthContext from '../contexts/AuthContext'

// ─── Helper ───────────────────────────────────────────────────────────────────

const getStoredAuth = (): { token: string | null; teacher: Teacher | null } => {
    try {
        const token = localStorage.getItem('token')
        const raw = localStorage.getItem('teacher')
        const teacher = raw ? (JSON.parse(raw) as Teacher) : null
        return { token, teacher }
    } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('teacher')
        return { token: null, teacher: null }
    }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const stored = getStoredAuth()
    const [teacher, setTeacher] = useState<Teacher | null>(stored.teacher)
    const [token, setToken] = useState<string | null>(stored.token)

    const login = (newToken: string, newTeacher: Teacher) => {
        localStorage.setItem('token', newToken)
        localStorage.setItem('teacher', JSON.stringify(newTeacher))
        setToken(newToken)
        setTeacher(newTeacher)
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('teacher')
        setToken(null)
        setTeacher(null)
    }

    return (
        <AuthContext.Provider value={{
            teacher,
            token,
            login,
            logout,
            isAuthenticated: !!token && !!teacher,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider