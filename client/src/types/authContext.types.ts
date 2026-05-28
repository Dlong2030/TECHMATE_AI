import type { Teacher } from '../types'

export interface AuthContextType {
    teacher: Teacher | null
    token: string | null
    login: (token: string, teacher: Teacher) => void
    logout: () => void
    isAuthenticated: boolean
}