import { createContext } from 'react'
import type { AuthContextType } from '../types/authContext.types'

const AuthContext = createContext<AuthContextType | null>(null)

export default AuthContext