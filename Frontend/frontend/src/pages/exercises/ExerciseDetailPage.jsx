import { useState, useEffect } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Loader2, Target, Dumbbell, Activity } from 'lucide-react'
import { getExerciseById, getExercisesByTarget } from '../../services/exercise.service'
import ExerciseCard from '../../components/ExerciseCard'

export default function ExerciseDetailPage() {
    const { id } = useParams()
    // const location = useLocation() // Removed to force API fetch
    const [exercise, setExercise] = useState(null)
    const [relatedExercises, setRelatedExercises] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true)
                window.scrollTo({ top: 0, behavior: 'smooth' })

                const exerciseData = await getExerciseById(id)
                setExercise(exerciseData)

                if (exerciseData && exerciseData.target) {
                    const relatedData = await getExercisesByTarget(exerciseData.target)
                    // Filter out the current exercise from related list
                    setRelatedExercises(relatedData.filter(ex => ex.id !== exerciseData.id).slice(0, 4) || [])
                }
            } catch (error) {
                console.error('Failed to fetch exercise details:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchDetails()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        )
    }

    if (!exercise) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <p className="text-gray-500 text-lg">Exercise not found.</p>
                <Link to="/exercises" className="text-indigo-600 hover:underline">Back to Exercises</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 pt-28">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Back Button */}
                <Link to="/exercises" className="inline-flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Exercises
                </Link>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Media Section */}
                    <div className="flex flex-col items-center">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full flex items-center justify-center overflow-hidden">
                            {exercise.videoUrl ? (
                                <video
                                    src={exercise.videoUrl}
                                    controls
                                    className="w-full h-auto max-h-[350px] lg:max-h-[500px] lg:w-[720px] rounded-xl"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <img
                                    src={exercise.gifUrl || exercise.imageUrl}
                                    alt={exercise.name}
                                    className="w-full h-auto object-contain mix-blend-multiply max-h-[350px] lg:max-h-[500px] lg:w-[720px]"
                                    style={{ borderRadius: '12px' }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 capitalize mb-4 tracking-tight">{exercise.name}</h1>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full font-medium capitalize flex items-center gap-2 text-sm">
                                    <Activity className="w-4 h-4" />
                                    {exercise.bodyPart}
                                </span>
                                <span className="px-4 py-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-full font-medium capitalize flex items-center gap-2 text-sm">
                                    <Target className="w-4 h-4" />
                                    {exercise.target}
                                </span>
                                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full font-medium capitalize flex items-center gap-2 text-sm">
                                    <Dumbbell className="w-4 h-4" />
                                    {exercise.equipment}
                                </span>
                            </div>
                        </div>

                        {/* Overview */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                The <span className="font-semibold capitalize">{exercise.name}</span> is a highly effective exercise that primarily targets the <span className="font-semibold capitalize">{exercise.target || exercise.bodyPart}</span>.
                                It is performed using <span className="font-semibold capitalize">{exercise.equipment}</span> and is excellent for building strength and stability.
                            </p>
                        </div>

                        {/* Exercise Tips */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">Exercise Tips</h2>
                            <ul className="list-disc list-inside space-y-2 text-gray-600">
                                {exercise.keywords && exercise.keywords.length > 0 ? (
                                    exercise.keywords.slice(0, 5).map((keyword, idx) => (
                                        <li key={idx} className="capitalize">{keyword}</li>
                                    ))
                                ) : (
                                    <>
                                        <li>Keep your core tight and back straight.</li>
                                        <li>Focus on controlled movements rather than speed.</li>
                                        <li>Breathe steadily throughout the exercise.</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">Instructions</h2>
                            <div className="space-y-4">
                                {exercise.instructions && exercise.instructions.map((instruction, index) => (
                                    <div key={index} className="flex gap-4 group">
                                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            {index + 1}
                                        </div>
                                        <p className="text-gray-600 leading-relaxed pt-1">{instruction}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Exercises */}
                {relatedExercises.length > 0 && (
                    <div className="space-y-6 pt-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900">Related Exercises</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedExercises.map((ex) => (
                                <ExerciseCard key={ex.id} exercise={ex} />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
