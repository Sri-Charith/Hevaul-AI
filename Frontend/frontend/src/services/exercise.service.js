import axios from 'axios'
import exercisesData from '../data/exercises.json'

const API_URL = '/api/exercises'

// Helper to get token from local storage
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` }
    }
    return {}
}

export const getAllExercises = async (limit = 200) => {
    // Return local data
    return exercisesData.slice(0, limit)
}

export const searchExercises = async (query) => {
    if (!query) return []

    const lowerQuery = query.toLowerCase()

    // Filter local data
    return exercisesData.filter(exercise =>
        exercise.name.toLowerCase().includes(lowerQuery) ||
        exercise.target.toLowerCase().includes(lowerQuery) ||
        exercise.equipment.toLowerCase().includes(lowerQuery) ||
        exercise.bodyPart.toLowerCase().includes(lowerQuery)
    )
}

export const getExerciseById = async (id) => {
    // Keep fetching details from API for fresh data
    const config = { headers: getAuthHeader() }
    const response = await axios.get(`${API_URL}/${id}`, config)
    return response.data
}

export const getExercisesByTarget = async (target) => {
    if (!target) return []
    const lowerTarget = target.toLowerCase()

    // Filter local data
    return exercisesData.filter(exercise =>
        exercise.target.toLowerCase() === lowerTarget
    )
}

export const getBodyParts = async () => {
    // Extract unique body parts from local data
    const bodyParts = [...new Set(exercisesData.map(ex => ex.bodyPart))]
    return bodyParts
}

export const getEquipments = async () => {
    // Extract unique equipment from local data
    const equipments = [...new Set(exercisesData.map(ex => ex.equipment))]
    return equipments
}

export const getExerciseTypes = async () => {
    // Not typically in standard ExerciseDB object, but if it was:
    // const types = [...new Set(exercisesData.map(ex => ex.type))]
    // return types
    const config = { headers: getAuthHeader() }
    const response = await axios.get(`${API_URL}/exercise-types`, config)
    return response.data
}
