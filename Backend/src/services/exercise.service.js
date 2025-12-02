import apiClient from './apiClient.js'

export const getAllExercises = async (limit = 10) => {
    const response = await apiClient.get('/exercises', {
        params: { limit }
    })
    return response.data.data
}

export const searchExercises = async (query) => {
    const response = await apiClient.get('/exercises/search', {
        params: { search: query }
    })
    return response.data.data
}

export const getExerciseById = async (id) => {
    const response = await apiClient.get(`/exercises/${id}`)
    return response.data.data
}

export const getEquipments = async () => {
    const response = await apiClient.get('/equipments')
    return response.data.data
}

export const getExerciseTypes = async () => {
    const response = await apiClient.get('/exercisetypes')
    return response.data.data
}

export const getBodyParts = async () => {
    const response = await apiClient.get('/bodyparts')
    return response.data.data
}

export const getMuscles = async () => {
    const response = await apiClient.get('/muscles')
    return response.data.data
}

export const getExercisesByTarget = async (target) => {
    const response = await apiClient.get(`/exercises/target/${target}`)
    return response.data.data
}
