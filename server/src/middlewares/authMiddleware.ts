import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import Teacher, { ITeacher } from './../models/Teacher'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

// ─── Extend Request để thêm teacher ──────────────────────────────────────────

export interface AuthRequest extends Request {
    teacher?: ITeacher
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export const protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Lấy token từ header
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Chưa đăng nhập' })
            return
        }

        const token = authHeader.split(' ')[1]

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string }

        // Tìm teacher từ id trong token
        const teacher = await Teacher.findById(decoded.id)
        if (!teacher || !teacher.isActive) {
            res.status(401).json({ success: false, message: 'Tài khoản không tồn tại hoặc đã bị khoá' })
            return
        }

        // Gắn teacher vào request để dùng ở controller
        req.teacher = teacher
        next()
    } catch (error) {
        res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' })
    }
}