import { Response } from 'express'
import { AuthRequest } from '../middlewares/authMiddleware'
import Character from '../models/Character'
import Session from '../models/Session'
import Message from '../models/Message'
import { streamChat, ChatMessage, AIProvider } from '../services/Aiservice'

// ─── POST /api/chat/send ──────────────────────────────────────────────────────

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teacher = req.teacher!
        const { sessionId, characterId, content, provider } = req.body

        if (!sessionId || !characterId || !content) {
            res.status(400).json({ success: false, message: 'Thiếu sessionId, characterId hoặc content' })
            return
        }

        // Lấy thông tin nhân vật
        const character = await Character.findById(characterId)
        if (!character) {
            res.status(404).json({ success: false, message: 'Không tìm thấy nhân vật' })
            return
        }

        // Lấy lịch sử chat trong session (tối đa 20 tin gần nhất để tiết kiệm token)
        const history = await Message.find({ sessionId })
            .sort({ createdAt: 1 })
            .limit(20)
            .select('role content')

        const messages: ChatMessage[] = history.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }))

        // Thêm tin nhắn mới của giáo viên vào
        messages.push({ role: 'user', content })

        // Lưu tin nhắn của giáo viên vào DB
        await Message.create({
            sessionId,
            teacherId: teacher._id,
            characterId,
            role: 'user',
            content,
        })

        // ─── Streaming response ───────────────────────────────────────────────────

        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')

        let fullResponse = ''

        await streamChat({
            systemPrompt: character.systemPrompt,
            messages,
            provider: (provider as AIProvider) ?? 'gemini',
            onChunk: (chunk) => {
                fullResponse += chunk
                res.write(`data: ${JSON.stringify({ chunk })}\n\n`)
            },
            onDone: async () => {
                // Lưu response của AI vào DB
                await Message.create({
                    sessionId,
                    teacherId: teacher._id,
                    characterId,
                    role: 'assistant',
                    content: fullResponse,
                })

                // Cập nhật totalMessages trong session
                await Session.findByIdAndUpdate(sessionId, {
                    $inc: { totalMessages: 2 }, // +1 user +1 assistant
                })

                res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
                res.end()
            },
            onError: (error) => {
                res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`)
                res.end()
            },
        })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi gửi tin nhắn' })
    }
}

// ─── GET /api/chat/:sessionId/history ────────────────────────────────────────

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.params

        const messages = await Message.find({ sessionId })
            .sort({ createdAt: 1 })
            .populate('characterId', 'name avatarUrl')

        res.json({ success: true, data: messages })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy lịch sử chat' })
    }
}