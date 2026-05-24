import { Schema, model, Document, Types } from 'mongoose'

// ─── Interface ────────────────────────────────────────────────────────────────

export type MessageRole = 'teacher' | 'assistant'

export interface IMessage {
    role: MessageRole
    content: string
    timestamp: Date
}

export interface ISession extends Document {
    teacherId: Types.ObjectId
    characterId: Types.ObjectId
    className: string
    subject: string
    grade: string
    messages: IMessage[]
    totalMessages: number
    createdAt: Date
    updatedAt: Date
}

// ─── Sub-schema: Message ──────────────────────────────────────────────────────

const MessageSchema = new Schema<IMessage>(
    {
        role: {
            type: String,
            enum: ['teacher', 'assistant'],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false } // không cần _id cho mỗi message
)

// ─── Schema ───────────────────────────────────────────────────────────────────

const SessionSchema = new Schema<ISession>(
    {
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
        className: {
            type: String,
            required: [true, 'Tên lớp là bắt buộc'],
            trim: true,
            // ví dụ: "3A", "4B"
        },
        subject: {
            type: String,
            required: [true, 'Môn học là bắt buộc'],
        },
        grade: {
            type: String,
            required: [true, 'Khối lớp là bắt buộc'],
        },
        messages: {
            type: [MessageSchema],
            default: [],
        },
        totalMessages: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

// ─── Tự cập nhật totalMessages ────────────────────────────────────────────────

SessionSchema.pre('save', async function (this: any) {
    if (this.messages) {
        this.totalMessages = this.messages.length;
    }
});

// ─── Index ────────────────────────────────────────────────────────────────────

SessionSchema.index({ teacherId: 1, createdAt: -1 }) // lấy session mới nhất của teacher
SessionSchema.index({ characterId: 1 })

// ─── Export ───────────────────────────────────────────────────────────────────

export default model<ISession>('Session', SessionSchema)