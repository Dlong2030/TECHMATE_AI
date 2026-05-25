import { Router } from 'express'
import { sendMessage, getChatHistory } from '../controllers/chatController'
import { protect } from '../middlewares/authMiddleware'

const router = Router()

// Tất cả chat routes đều cần đăng nhập
router.use(protect)

router.post('/send', sendMessage)
router.get('/:sessionId/history', getChatHistory)

export default router