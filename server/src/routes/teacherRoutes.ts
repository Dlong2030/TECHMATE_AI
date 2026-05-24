import { Router } from 'express'
import { register, login, getMe, updateTeacher } from '../controllers/teacherController'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/:id', getMe)
router.put('/:id', updateTeacher)

export default router