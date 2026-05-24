import { Router } from 'express'
import {
    getCharacters,
    getCharacterById,
    createCharacter,
    updateCharacter,
    deleteCharacter,
} from '../controllers/characterController'

const router = Router()

router.get('/teacher/:teacherId', getCharacters)
router.get('/:id', getCharacterById)
router.post('/', createCharacter)
router.put('/:id', updateCharacter)
router.delete('/:id', deleteCharacter)

export default router