import multer from 'multer'

// Lưu ảnh vào RAM thay vì disk — upload thẳng lên Cloudinary
const storage = multer.memoryStorage()

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Chỉ chấp nhận file JPG, PNG hoặc WEBP'))
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // tối đa 5MB
})

export default upload