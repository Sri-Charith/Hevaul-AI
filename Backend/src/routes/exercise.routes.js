import express from 'express'

import {
    getExercises,
    searchExercises,
    getExerciseById,
    getEquipments,
    getExerciseTypes,
    getBodyParts,
    getMuscles,
    getExercisesByTarget
} from '../controllers/exercise.controller.js'

const router = express.Router()



router.get('/', getExercises)
router.get('/search', searchExercises)
router.get('/equipments', getEquipments)
router.get('/exercise-types', getExerciseTypes)
router.get('/bodyparts', getBodyParts)
router.get('/muscles', getMuscles)
router.get('/target/:target', getExercisesByTarget)
router.get('/:id', getExerciseById)

export default router
