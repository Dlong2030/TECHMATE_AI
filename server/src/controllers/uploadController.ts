import { Response } from 'express'
import { UploadApiResponse } from 'cloudinary'
import streamifier from 'streamifier'
import cloudinary from '../config/cloudinary'
import { AuthRequest } from '../middlewares/authMiddleware'

// ─── POST /api/upload/avatar ──────────────────────────────────────────────────
// Upload 1 hoặc 2 ảnh (idle + talk) cho nhân vật

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] }

        if (!files || (!files.idle && !files.talk)) {
            res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất 1 ảnh' })
            return
        }

        const { characterName } = req.body
        if (!characterName) {
            res.status(400).json({ success: false, message: 'Thiếu tên nhân vật' })
            return
        }

        // Helper: upload buffer lên Cloudinary
        const uploadToCloudinary = (buffer: Buffer, publicId: string): Promise<UploadApiResponse> => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'techmate-ai/characters',
                        public_id: publicId,
                        overwrite: true,
                        transformation: [
                            { width: 500, height: 500, crop: 'fit' },
                            { quality: 'auto', fetch_format: 'auto' },
                        ],
                    },
                    (error, result) => {
                        if (error || !result) reject(error)
                        else resolve(result)
                    }
                )
                streamifier.createReadStream(buffer).pipe(stream)
            })
        }

        const slug = characterName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')

        const result: Record<string, string> = {}

        // Upload idle image
        if (files.idle?.[0]) {
            const idleRes = await uploadToCloudinary(files.idle[0].buffer, `${slug}_idle`)
            result.idleUrl = idleRes.secure_url
        }

        // Upload talk image
        if (files.talk?.[0]) {
            const talkRes = await uploadToCloudinary(files.talk[0].buffer, `${slug}_talk`)
            result.talkUrl = talkRes.secure_url
        }

        res.json({ success: true, data: result })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Lỗi khi upload ảnh'
        res.status(500).json({ success: false, message })
    }
}