import { Schema, model, Document } from 'mongoose'
import * as bcrypt from 'bcryptjs'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ITeacher extends Document {
    name: string
    email: string
    password: string
    school: string
    avatarUrl?: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    comparePassword(candidatePassword: string): Promise<boolean>
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const TeacherSchema = new Schema<ITeacher>(
    {
        name: {
            type: String,
            required: [true, 'Tên giáo viên là bắt buộc'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email là bắt buộc'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Mật khẩu là bắt buộc'],
            minlength: [6, 'Mật khẩu tối thiểu 6 ký tự'],
            select: false, // không trả về password khi query
        },
        school: {
            type: String,
            required: [true, 'Tên trường là bắt buộc'],
            trim: true,
        },
        avatarUrl: {
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

// ─── Hash password trước khi lưu ─────────────────────────────────────────────

TeacherSchema.pre('save', async function (this: ITeacher, next) {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

// ─── Method so sánh password ──────────────────────────────────────────────────

TeacherSchema.methods.comparePassword = async function (
    this: ITeacher,
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password)
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default model<ITeacher>('Teacher', TeacherSchema)