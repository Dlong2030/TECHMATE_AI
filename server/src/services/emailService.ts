import nodemailer from 'nodemailer'

// ─── Transporter ──────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

console.log('GMAIL_USER:', process.env.GMAIL_USER)
console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD)

// ─── Gửi OTP ──────────────────────────────────────────────────────────────────

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"Classroom AI" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Mã xác nhận đăng ký tài khoản',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1D9E75; margin-bottom: 8px;">Classroom AI</h2>
        <p style="color: #555; margin-bottom: 24px;">Xin chào! Đây là mã xác nhận của bạn:</p>

        <div style="background: #f4f4f4; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #1a1a1a;">
            ${otp}
          </span>
        </div>

        <p style="color: #888; font-size: 14px;">Mã có hiệu lực trong <strong>5 phút</strong>.</p>
        <p style="color: #888; font-size: 14px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
      </div>
    `,
    })
  } catch (error) {
    console.error('Email error:', error) 
  }
}