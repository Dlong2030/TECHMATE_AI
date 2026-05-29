import { Schema, model, Document, Types } from 'mongoose'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ICharacter extends Document {
    teacherId: Types.ObjectId
    name: string
    subject: string
    grade: string
    personality: string
    systemPrompt: string
    idleImageUrl: string  // ảnh miệng đóng
    talkImageUrl: string  // ảnh miệng mở
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const CharacterSchema = new Schema<ICharacter>(
    {
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: 'Teacher',
            required: [true, 'teacherId là bắt buộc'],
        },
        name: {
            type: String,
            required: [true, 'Tên nhân vật là bắt buộc'],
            trim: true,
        },
        subject: {
            type: String,
            required: [true, 'Môn học là bắt buộc'],
            enum: ['Toán', 'Tiếng Việt', 'Tự nhiên xã hội', 'Khoa học', 'Đạo đức', 'Khác'],
        },
        grade: {
            type: String,
            required: [true, 'Khối lớp là bắt buộc'],
            enum: ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Tất cả'],
            default: 'Tất cả',
        },
        personality: {
            type: String,
            required: [true, 'Mô tả tính cách là bắt buộc'],
            trim: true,
        },
        systemPrompt: {
            type: String,
            required: [true, 'System prompt là bắt buộc'],
        },
        idleImageUrl: {
            type: String,
            default: '',
        },
        talkImageUrl: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
)

// ─── Index ────────────────────────────────────────────────────────────────────

CharacterSchema.index({ teacherId: 1, isActive: 1 })

// ─── Export ───────────────────────────────────────────────────────────────────

export default model<ICharacter>('Character', CharacterSchema)