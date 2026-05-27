// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface Teacher {
    _id: string
    name: string
    email: string
    school: string
    avatarUrl?: string
    isActive: boolean
    createdAt: string
}

export interface AuthResponse {
    success: boolean
    token: string
    data: Teacher
}

// ─── Character ────────────────────────────────────────────────────────────────

export type Subject = 'Toán' | 'Tiếng Việt' | 'Tự nhiên xã hội' | 'Khoa học' | 'Đạo đức' | 'Khác'
export type Grade = 'Lớp 1' | 'Lớp 2' | 'Lớp 3' | 'Lớp 4' | 'Lớp 5' | 'Tất cả'

export interface Character {
    _id: string
    teacherId: string
    name: string
    subject: Subject
    grade: Grade
    personality: string
    systemPrompt: string
    avatarUrl?: string
    isActive: boolean
    createdAt: string
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface Session {
    _id: string
    teacherId: string
    characterId: Character
    className: string
    subject: string
    grade: string
    totalMessages: number
    createdAt: string
}

// ─── Message ──────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant'

export interface Message {
    _id: string
    sessionId: string
    role: MessageRole
    content: string
    createdAt: string
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
    success: boolean
    data: T
    message?: string
}