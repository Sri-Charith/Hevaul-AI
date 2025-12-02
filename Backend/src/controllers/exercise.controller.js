import * as exerciseService from '../services/exercise.service.js'

export const getExercises = async (req, res, next) => {
    try {
        const { limit } = req.query
        const exercises = await exerciseService.getAllExercises(limit)
        res.json(exercises)
    } catch (error) {
        next(error)
    }
}

export const searchExercises = async (req, res, next) => {
    try {
        const { search } = req.query
        if (!search) {
            return res.status(400).json({ message: 'Search query is required' })
        }
        const exercises = await exerciseService.searchExercises(search)
        res.json(exercises)
    } catch (error) {
        next(error)
    }
}

export const getExerciseById = async (req, res, next) => {
    try {
        const { id } = req.params
        const exercise = await exerciseService.getExerciseById(id)
        if (!exercise) {
            return res.status(404).json({ message: 'Exercise not found' })
        }
        res.json(exercise)
    } catch (error) {
        next(error)
    }
}

export const getExercisesByTarget = async (req, res, next) => {
    try {
        const { target } = req.params
        const exercises = await exerciseService.getExercisesByTarget(target)
        res.json(exercises)
    } catch (error) {
        next(error)
    }
}

export const getEquipments = async (req, res, next) => {
    try {
        const equipments = await exerciseService.getEquipments()
        res.json(equipments)
    } catch (error) {
        next(error)
    }
}

export const getExerciseTypes = async (req, res, next) => {
    try {
        const types = await exerciseService.getExerciseTypes()
        res.json(types)
    } catch (error) {
        next(error)
    }
}

export const getBodyParts = async (req, res, next) => {
    try {
        const bodyParts = await exerciseService.getBodyParts()
        res.json(bodyParts)
    } catch (error) {
        next(error)
    }
}

export const getMuscles = async (req, res, next) => {
    try {
        const muscles = await exerciseService.getMuscles()
        res.json(muscles)
    } catch (error) {
        next(error)
    }
}
