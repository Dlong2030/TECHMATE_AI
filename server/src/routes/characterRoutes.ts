import { Router } from 'express'
import {
    getCharacters,
    getCharacterById,
    createCharacter,
    updateCharacter,
    deleteCharacter,
} from '../controllers/characterController'
import { protect } from '../middlewares/authMiddleware'

const router = Router()
router.use(protect) // Bảo vệ tất cả routes sau bằng middleware xác thực

router.get('/', getCharacters)
router.get('/:id', getCharacterById)
router.post('/', createCharacter)
router.put('/:id', updateCharacter)
router.delete('/:id', deleteCharacter)

export default router