import { Router } from 'express'
import { uploadAvatar } from '../controllers/uploadController'
import { protect } from '../middlewares/authMiddleware'
import upload from '../middlewares/uploadMiddleware'

const router = Router()

router.use(protect)

// fields: nhận 2 file cùng lúc — idle và talk
router.post(
    '/avatar',
    upload.fields([
        { name: 'idle', maxCount: 1 },
        { name: 'talk', maxCount: 1 },
    ]),
    uploadAvatar
)

export default router