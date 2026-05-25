import { Request, Response } from 'express'
import Otp from '../models/Otp'
import Teacher from '../models/Teacher'
import { sendOtpEmail } from '../services/emailService'

// ─── Helper: tạo OTP 6 số ────────────────────────────────────────────────────

const generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// ─── POST /api/otp/send ───────────────────────────────────────────────────────
// Bước 1: Người dùng nhập email → gửi OTP

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body

        if (!email) {
            res.status(400).json({ success: false, message: 'Vui lòng nhập email' })
            return
        }

        // Kiểm tra email đã đăng ký chưa
        const existingTeacher = await Teacher.findOne({ email })
        if (existingTeacher) {
            res.status(400).json({ success: false, message: 'Email này đã được đăng ký' })
            return
        }

        // Xoá OTP cũ nếu có (tránh tồn đọng)
        await Otp.deleteMany({ email })

        // Tạo và lưu OTP mới
        const otp = generateOtp()
        await Otp.create({ email, otp })

        // Gửi email
        await sendOtpEmail(email, otp)

        res.json({ success: true, message: `Mã xác nhận đã được gửi đến ${email}` })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi gửi mã xác nhận' })
    }
}

// ─── POST /api/otp/verify ─────────────────────────────────────────────────────
// Bước 2: Người dùng nhập OTP → xác nhận

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body

        if (!email || !otp) {
            res.status(400).json({ success: false, message: 'Vui lòng nhập email và mã xác nhận' })
            return
        }

        // Tìm OTP còn hiệu lực (chưa dùng, chưa hết hạn)
        const otpRecord = await Otp.findOne({ email, isUsed: false })
        if (!otpRecord) {
            res.status(400).json({ success: false, message: 'Mã xác nhận không hợp lệ hoặc đã hết hạn' })
            return
        }

        // So sánh OTP
        const isMatch = await otpRecord.compareOtp(otp)
        if (!isMatch) {
            res.status(400).json({ success: false, message: 'Mã xác nhận không đúng' })
            return
        }

        // Đánh dấu đã dùng
        otpRecord.isUsed = true
        await otpRecord.save()

        res.json({ 
            success: true,
            message: 'Xác nhận email thành công',
            email, // trả về để frontend dùng ở bước điền thông tin tiếp theo
        })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi xác nhận mã' })
    }
}