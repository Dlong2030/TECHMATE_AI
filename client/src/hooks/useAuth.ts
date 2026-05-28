import { useContext } from 'react'
import AuthContext from '../contexts/AuthContext'

const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider')
    return ctx
}

export default useAuth