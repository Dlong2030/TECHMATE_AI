import { Request, Response } from 'express'
import Character from '../models/Character'

// ─── GET /api/characters ──────────────────────────────────────────────────────

export const getCharacters = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teacherId } = req.params
        const characters = await Character.find({ teacherId, isActive: true }).sort({ createdAt: -1 })
        res.json({ success: true, data: characters })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách nhân vật' })
    }
}

// ─── GET /api/characters/:id ──────────────────────────────────────────────────

export const getCharacterById = async (req: Request, res: Response): Promise<void> => {
    try {
        const character = await Character.findById(req.params.id)
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

export const createCharacter = async (req: Request, res: Response): Promise<void> => {
    try {
        const { teacherId, name, subject, grade, personality, systemPrompt, avatarUrl } = req.body

        const character = await Character.create({
            teacherId,
            name,
            subject,
            grade,
            personality,
            systemPrompt,
            avatarUrl,
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

export const updateCharacter = async (req: Request, res: Response): Promise<void> => {
    try {
        const character = await Character.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
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

export const deleteCharacter = async (req: Request, res: Response): Promise<void> => {
    try {
        // Soft delete — chỉ set isActive = false, không xoá khỏi DB
        const character = await Character.findByIdAndUpdate(
            req.params.id,
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