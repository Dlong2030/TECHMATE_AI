import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import Teacher from '../models/Teacher'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// ─── Helper: tạo token ────────────────────────────────────────────────────────

const generateToken = (id: string): string => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// ─── POST /api/teachers/register ─────────────────────────────────────────────

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, school } = req.body

        const existing = await Teacher.findOne({ email })
        if (existing) {
            res.status(400).json({ success: false, message: 'Email đã được sử dụng' })
            return
        }

        const teacher = await Teacher.create({ name, email, password, school })

        const token = generateToken(teacher._id.toString())

        res.status(201).json({
            success: true,
            token,
            data: {
                _id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                school: teacher.school,
            },
        })
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e: any) => e.message)
            res.status(400).json({ success: false, message: messages.join(', ') })
            return
        }
        res.status(500).json({ success: false, message: 'Lỗi khi đăng ký' })
    }
}

// ─── POST /api/teachers/login ─────────────────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' })
            return
        }

        // Lấy thêm password vì field có select: false
        const teacher = await Teacher.findOne({ email }).select('+password')
        if (!teacher) {
            res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' })
            return
        }

        const isMatch = await teacher.comparePassword(password)
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' })
            return
        }

        const token = generateToken(teacher._id.toString())

        res.json({
            success: true,
            token,
            data: {
                _id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                school: teacher.school,
            },
        })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi đăng nhập' })
    }
}

// ─── GET /api/teachers/me ─────────────────────────────────────────────────────

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const teacher = await Teacher.findById(req.params.id)
        if (!teacher) {
            res.status(404).json({ success: false, message: 'Không tìm thấy giáo viên' })
            return
        }
        res.json({ success: true, data: teacher })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin' })
    }
}

// ─── PUT /api/teachers/:id ────────────────────────────────────────────────────

export const updateTeacher = async (req: Request, res: Response): Promise<void> => {
    try {
        // Không cho update password qua route này
        const { password, ...updateData } = req.body

        const teacher = await Teacher.findByIdAndUpdate(
            req.params.id,
            { ...updateData },
            { new: true, runValidators: true }
        )

        if (!teacher) {
            res.status(404).json({ success: false, message: 'Không tìm thấy giáo viên' })
            return
        }

        res.json({ success: true, data: teacher })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật thông tin' })
    }
}