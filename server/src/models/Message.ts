import { Schema, model, Document, Types } from 'mongoose'

// ─── Interface ────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant'

export interface IMessage extends Document {
    sessionId: Types.ObjectId
    teacherId: Types.ObjectId
    characterId: Types.ObjectId
    role: MessageRole
    content: string
    createdAt: Date
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const MessageSchema = new Schema<IMessage>(
    {
        sessionId: {
            type: Schema.Types.ObjectId,
            ref: 'Session',
            required: [true, 'sessionId là bắt buộc'],
        },
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
            required: [true, 'teacherId là bắt buộc'],
        },
        characterId: {
            type: Schema.Types.ObjectId,
            ref: 'Character',
            required: [true, 'characterId là bắt buộc'],
        },
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: [true, 'role là bắt buộc'],
        },
        content: {
            type: String,
            required: [true, 'Nội dung tin nhắn là bắt buộc'],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
)

// ─── Index ────────────────────────────────────────────────────────────────────

MessageSchema.index({ sessionId: 1, createdAt: 1 }) // lấy messages theo thứ tự thời gian
MessageSchema.index({ teacherId: 1 })

// ─── Export ───────────────────────────────────────────────────────────────────

export default model<IMessage>('Message', MessageSchema)