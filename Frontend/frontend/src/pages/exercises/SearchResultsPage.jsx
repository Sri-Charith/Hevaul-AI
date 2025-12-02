import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { searchExercises } from '../../services/exercise.service'
import ExerciseCard from '../../components/ExerciseCard'

export default function SearchResultsPage() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('search')
    const bodyPart = searchParams.get('bodypart')

    const [exercises, setExercises] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchResults = async () => {
            if (!query && !bodyPart) return

            try {
                setLoading(true)
                let data = []

                if (bodyPart) {
                    // Dynamic import for body part JSON
                    try {
                        // Vite supports dynamic imports with globs or specific paths
                        // We need to ensure the path is correct relative to this file
                        const module = await import(`../../data/${bodyPart}.json`)
                        const rawData = module.default || []

                        // Handle different JSON structures
                        if (Array.isArray(rawData)) {
                            data = rawData
                        } else if (typeof rawData === 'object') {
                            // Try to find the first array property
                            const values = Object.values(rawData)
                            const arrayValue = values.find(val => Array.isArray(val))
                            data = arrayValue || []
                        } else {
                            data = []
                        }
                    } catch (err) {
                        console.error(`Failed to load data for ${bodyPart}:`, err)
                        // Fallback or empty if file not found
                        data = []
                    }
                } else if (query) {
                    data = await searchExercises(query)
                }

                setExercises(data || [])
            } catch (error) {
                console.error('Search failed:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [query, bodyPart])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 pt-28">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="space-y-4">
                    <Link to="/exercises" className="inline-flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to All Exercises
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {bodyPart ? (
                            <>Exercises for <span className="text-indigo-600 capitalize">{bodyPart}</span></>
                        ) : (
                            <>Search results for: <span className="text-indigo-600">"{query}"</span></>
                        )}
                    </h1>
                    <p className="text-gray-500">Found {exercises.length} exercises</p>
                </div>

                <div className="h-px bg-gray-200 w-full"></div>

                {/* Results Grid */}
                {exercises.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                        {exercises.map((exercise, index) => (
                            <ExerciseCard key={exercise.id || index} exercise={exercise} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500 text-lg">No exercises found for "{bodyPart || query}".</p>
                        <p className="text-gray-400 mt-2">Try searching for body parts (e.g., "chest") or exercise names (e.g., "push up").</p>
                    </div>
                )}

            </div>
        </div>
    )
}
