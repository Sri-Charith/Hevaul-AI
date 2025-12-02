import { Link } from 'react-router-dom'

export default function ExerciseCard({ exercise }) {
    // Safety checks to ensure we don't try to render objects
    const name = typeof exercise.name === 'string' ? exercise.name : 'Unknown Exercise'
    const bodyPart = typeof exercise.bodyPart === 'string' ? exercise.bodyPart : ''
    const equipment = typeof exercise.equipment === 'string' ? exercise.equipment : ''
    const target = typeof exercise.target === 'string' ? exercise.target : ''
    const gifUrl = (typeof exercise.gifUrl === 'string' ? exercise.gifUrl : '') || (typeof exercise.imageUrl === 'string' ? exercise.imageUrl : '')

    return (
        <Link
            to={`/exercises/${exercise.id}`}
            state={{ exercise }}
            className="group flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all w-[90%] md:w-[420px] mx-auto"
        >
            <div className="w-full h-auto md:h-[420px] max-h-[350px] md:max-h-[420px] bg-white p-4 flex items-center justify-center relative border-b border-gray-50">
                {gifUrl ? (
                    <img
                        src={gifUrl}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-contain mix-blend-multiply"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
                        No Image
                    </div>
                )}

                {bodyPart && (
                    <div className="absolute top-3 right-3 flex gap-2">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg capitalize">
                            {bodyPart}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-gray-900 text-lg capitalize mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {name}
                </h3>

                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                    {equipment && (
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md capitalize">
                            {equipment}
                        </span>
                    )}
                    {target && (
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md capitalize">
                            {target}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}
