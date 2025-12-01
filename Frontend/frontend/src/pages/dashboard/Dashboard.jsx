import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { LogOut } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'User'}!</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard content */}
        </div>
      </div>
    </div>
  )
}
