import { Link } from 'react-router-dom'
import { Button, buttonVariants } from '../components/ui/button.jsx'
import { ArrowRight, Sparkles, Utensils, Moon, Droplet, Pill, Brain, LogOut, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore.js'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/utils.js'

export default function Landing() {
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()
  const isAuthenticated = !!token

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Navigation Bar */}
      {isAuthenticated && (
        <nav className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Hevaul AI
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 hidden sm:inline-block">Welcome, {user?.name || 'User'}!</span>

                <Link
                  to="/profile"
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'icon' }),
                    "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  )}
                  title="Profile"
                >
                  <User className="h-5 w-5" />
                </Link>

                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">

          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Hevaul AI
            </h1>
          </div>

          <p className="text-xl text-gray-600 mb-4">
            Your intelligent health companion
          </p>

          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Track your diet, sleep, water intake, and medications. Get AI-powered
            recommendations to optimize your health and wellness.
          </p>

          {isAuthenticated ? (
            /* Authenticated User - Show Navigation Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Link
                to="/diet"
                className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-500"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
                    <Utensils className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Diet Tracker</h3>
                  <p className="text-gray-600 text-sm">
                    Track calories, macros, and nutrition
                  </p>
                </div>
              </Link>

              <Link
                to="/sleep"
                className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-500"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors">
                    <Moon className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Sleep Log</h3>
                  <p className="text-gray-600 text-sm">
                    Monitor your sleep patterns
                  </p>
                </div>
              </Link>

              <Link
                to="/water"
                className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-500"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-cyan-500 transition-colors">
                    <Droplet className="h-8 w-8 text-cyan-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Water Intake</h3>
                  <p className="text-gray-600 text-sm">
                    Track daily hydration
                  </p>
                </div>
              </Link>

              <Link
                to="/medication"
                className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-500"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
                    <Pill className="h-8 w-8 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Medications</h3>
                  <p className="text-gray-600 text-sm">
                    Manage medication schedules
                  </p>
                </div>
              </Link>

              <Link
                to="/ai"
                className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-500"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
                    <Brain className="h-8 w-8 text-purple-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Assistant</h3>
                  <p className="text-gray-600 text-sm">
                    Get personalized health insights
                  </p>
                </div>
              </Link>

              <Link
                to="/dashboard"
                className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-500"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-500 transition-colors">
                    <Sparkles className="h-8 w-8 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard</h3>
                  <p className="text-gray-600 text-sm">
                    View all your health data
                  </p>
                </div>
              </Link>
            </div>
          ) : (
            /* Unauthenticated User - Show Auth Buttons */
            <div className="flex gap-4 justify-center">
              <Link
                to="/signup"
                className={cn(
                  buttonVariants({ variant: 'default', size: 'lg' }),
                  "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-8 py-6 text-lg"
                )}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              <Link
                to="/login"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  "px-8 py-6 text-lg"
                )}
              >
                Sign In
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
