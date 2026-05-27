import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
})

// ─── Tự động gắn token vào mỗi request ───────────────────────────────────────

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// ─── Tự động logout nếu token hết hạn ────────────────────────────────────────

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// ─── Auth APIs ────────────────────────────────────────────────────────────────

export const authApi = {
    sendOtp: (email: string) =>
        api.post('/otp/send', { email }),

    verifyOtp: (email: string, otp: string) =>
        api.post('/otp/verify', { email, otp }),

    register: (data: { name: string; email: string; password: string; school: string }) =>
        api.post('/teachers/register', data),

    login: (email: string, password: string) =>
        api.post('/teachers/login', { email, password }),

    getMe: (id: string) =>
        api.get(`/teachers/${id}`),
}

export default api