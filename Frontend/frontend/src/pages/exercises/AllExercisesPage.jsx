import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, Dumbbell, Activity, Heart, User } from 'lucide-react'

const CATEGORIES = [
    { id: 'chest', name: 'Chest', icon: Activity, color: 'bg-blue-100 text-blue-600' },
    { id: 'back', name: 'Back', icon: User, color: 'bg-indigo-100 text-indigo-600' },
    { id: 'legs', name: 'Legs', icon: Dumbbell, color: 'bg-green-100 text-green-600' },
    { id: 'abs', name: 'Abs', icon: Heart, color: 'bg-red-100 text-red-600' },
    { id: 'biceps', name: 'Biceps', icon: Dumbbell, color: 'bg-orange-100 text-orange-600' },
    { id: 'triceps', name: 'Triceps', icon: Dumbbell, color: 'bg-orange-100 text-orange-600' },
    { id: 'shoulders', name: 'Shoulders', icon: User, color: 'bg-purple-100 text-purple-600' },
]

export default function AllExercisesPage() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/exercises/search?search=${encodeURIComponent(searchQuery)}`)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6 pt-20">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header & Search */}
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900">Find Your Exercise</h1>
                    <p className="text-gray-600 text-lg">Browse by category or search for specific exercises to add to your workout routine.</p>

                    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search exercises (e.g. bench press, squat)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-5 bg-white border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 outline-none shadow-lg shadow-blue-900/5 text-lg transition-all placeholder:text-gray-400"
                        />
                    </form>
                </div>

                {/* Categories Grid */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Body Part</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {CATEGORIES.map((category) => (
                            <Link
                                key={category.id}
                                to={`/exercises/search?bodypart=${category.id}`}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100 transition-all duration-300 group flex flex-col items-center text-center space-y-4"
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${category.color} group-hover:scale-110 transition-transform`}>
                                    <category.icon className="w-8 h-8" />
                                </div>
                                <h3 className="font-semibold text-gray-900 text-lg">{category.name}</h3>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
