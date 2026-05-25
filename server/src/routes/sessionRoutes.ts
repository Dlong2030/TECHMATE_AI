import { Router } from 'express'
import { createSession, getSessions, getSessionById, deleteSession } from '../controllers/sessionController'
import { protect } from '../middlewares/authMiddleware'

const router = Router()

router.use(protect)

router.post('/', createSession)
router.get('/', getSessions)
router.get('/:id', getSessionById)
router.delete('/:id', deleteSession)

export default router