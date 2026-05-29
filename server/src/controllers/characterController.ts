import { Response } from 'express'
import { AuthRequest } from '../middlewares/authMiddleware'
import Character from '../models/Character'

// ─── GET /api/characters ──────────────────────────────────────────────────────

export const getCharacters = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teacher = req.teacher!
        const characters = await Character.find({ teacherId: teacher._id, isActive: true }).sort({ createdAt: -1 })
        res.json({ success: true, data: characters })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách nhân vật' })
    }
}

// ─── GET /api/characters/:id ──────────────────────────────────────────────────

export const getCharacterById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teacher = req.teacher!

        const character = await Character.findOne({ _id: req.params.id, teacherId: teacher._id })
        if (!character) {
            res.status(404).json({ success: false, message: 'Không tìm thấy nhân vật' })
            return
        }
        res.json({ success: true, data: character })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin nhân vật' })
    }
}

// ─── POST /api/characters ─────────────────────────────────────────────────────

export const createCharacter = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teacher = req.teacher!
        const { name, subject, grade, personality, systemPrompt, idleImageUrl, talkImageUrl } = req.body

        const character = await Character.create({
            teacherId: teacher._id,
            name, subject, grade, personality, systemPrompt,
            idleImageUrl, talkImageUrl,
        })

        res.status(201).json({ success: true, data: character })
    } catch (error: any) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((e: any) => e.message)
            res.status(400).json({ success: false, message: messages.join(', ') })
            return
        }
        res.status(500).json({ success: false, message: 'Lỗi khi tạo nhân vật' })
    }
}

// ─── PUT /api/characters/:id ──────────────────────────────────────────────────

export const updateCharacter = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teacher = req.teacher!

        // Không cho phép đổi teacherId
        const { teacherId, ...updateData } = req.body

        const character = await Character.findOneAndUpdate(
            { _id: req.params.id, teacherId: teacher._id }, // chỉ update nhân vật của mình
            { ...updateData },
            { new: true, runValidators: true }
        )

        if (!character) {
            res.status(404).json({ success: false, message: 'Không tìm thấy nhân vật' })
            return
        }

        res.json({ success: true, data: character })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật nhân vật' })
    }
}

// ─── DELETE /api/characters/:id ───────────────────────────────────────────────

export const deleteCharacter = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teacher = req.teacher!

        // Soft delete — chỉ set isActive = false, không xoá khỏi DB
        const character = await Character.findOneAndUpdate(
            { _id: req.params.id, teacherId: teacher._id }, // chỉ xoá nhân vật của mình
            { isActive: false },
            { new: true }
        )

        if (!character) {
            res.status(404).json({ success: false, message: 'Không tìm thấy nhân vật' })
            return
        }

        res.json({ success: true, message: 'Đã xoá nhân vật' })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi xoá nhân vật' })
    }
}