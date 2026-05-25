import { Response } from 'express'
import { AuthRequest } from '../middlewares/authMiddleware'
import Session from '../models/Session'
import Character from '../models/Character'

// ─── POST /api/sessions ───────────────────────────────────────────────────────
// Tạo session mới khi bắt đầu buổi học

export const createSession = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teacher = req.teacher!
        const { characterId, className, subject, grade } = req.body

        if (!characterId || !className || !subject || !grade) {
            res.status(400).json({ success: false, message: 'Thiếu characterId, className, subject hoặc grade' })
            return
        }

        // Kiểm tra nhân vật có tồn tại và thuộc giáo viên này không
        const character = await Character.findOne({ _id: characterId, teacherId: teacher._id })
        if (!character) {
            res.status(404).json({ success: false, message: 'Không tìm thấy nhân vật' })
            return
        }

        const session = await Session.create({
            teacherId: teacher._id,
            characterId,
            className,
            subject,
            grade,
        })

        res.status(201).json({ success: true, data: session })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi tạo session' })
    }
}

// ─── GET /api/sessions ────────────────────────────────────────────────────────
// Lấy danh sách tất cả session của giáo viên

export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teacher = req.teacher!

        const sessions = await Session.find({ teacherId: teacher._id })
            .sort({ createdAt: -1 })
            .populate('characterId', 'name avatarUrl subject')

        res.json({ success: true, data: sessions })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách session' })
    }
}

// ─── GET /api/sessions/:id ────────────────────────────────────────────────────
// Lấy chi tiết một session

export const getSessionById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teacher = req.teacher!

        const session = await Session.findOne({ _id: req.params.id, teacherId: teacher._id })
            .populate('characterId', 'name avatarUrl subject systemPrompt')

        if (!session) {
            res.status(404).json({ success: false, message: 'Không tìm thấy session' })
            return
        }

        res.json({ success: true, data: session })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin session' })
    }
}

// ─── DELETE /api/sessions/:id ─────────────────────────────────────────────────
// Kết thúc / xoá session

export const deleteSession = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teacher = req.teacher!

        const session = await Session.findOneAndDelete({ _id: req.params.id, teacherId: teacher._id })

        if (!session) {
            res.status(404).json({ success: false, message: 'Không tìm thấy session' })
            return
        }

        res.json({ success: true, message: 'Đã xoá session' })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi xoá session' })
    }
}