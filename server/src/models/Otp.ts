import { Schema, model, Document } from 'mongoose'
import * as bcrypt from 'bcryptjs'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IOtp extends Document {
    email: string
    otp: string
    isUsed: boolean
    createdAt: Date
    compareOtp(candidateOtp: string): Promise<boolean>
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const OtpSchema = new Schema<IOtp>({
    email: {
        type: String,
        required: [true, 'Email là bắt buộc'],
        lowercase: true,
        trim: true,
    },
    otp: {
        type: String,
        required: [true, 'Mã OTP là bắt buộc'],
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
    // Tự động xóa document sau 300 giây (5 phút)
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300,
    },
})

// ─── Hash OTP trước khi lưu ───────────────────────────────────────────────────

OtpSchema.pre<IOtp>('save', async function (next) {
    if (!this.isModified('otp')) return;
    const salt = await bcrypt.genSalt(10)
    this.otp = await bcrypt.hash(this.otp, salt)
})

// ─── Method so sánh OTP ───────────────────────────────────────────────────────

OtpSchema.methods.compareOtp = async function (candidateOtp: string): Promise<boolean> {
    return bcrypt.compare(candidateOtp, this.otp)
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default model<IOtp>('Otp', OtpSchema)