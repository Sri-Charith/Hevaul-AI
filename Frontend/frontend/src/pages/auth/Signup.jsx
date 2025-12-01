import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore.js'
import { Button } from '../../components/ui/button.jsx'
import { Input } from '../../components/ui/input.jsx'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card.jsx'
import { toast } from 'sonner'
import { User, Mail, Lock, ArrowRight } from 'lucide-react'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const register = useAuthStore((state) => state.register)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error('Password too short', {
        description: 'Password must be at least 6 characters',
      })
      return
    }

    setIsLoading(true)

    const result = await register(name, email, password)

    if (result.success) {
      toast.success('Account created!', {
        description: 'Welcome to Hevaul AI!',
      })
      navigate('/')
    } else {
      toast.error('Registration failed', {
        description: result.error || 'Please try again',
      })
    }

    setIsLoading(false)
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom right, #2563eb, #3b82f6, #1e40af)'
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      
      <Card 
        className="w-full max-w-md shadow-2xl border-0 relative z-10"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <CardHeader className="space-y-3 text-center px-8 pt-10 pb-6">
          <div 
            className="mx-auto w-16 h-16 rounded-xl flex items-center justify-center shadow-lg mb-2"
            style={{
              background: 'linear-gradient(to bottom right, #2563eb, #1d4ed8)'
            }}
          >
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 tracking-tight">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-600 text-base">
            Sign up to get started with Hevaul AI
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700 block">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 h-5 w-5 transition-colors group-focus-within:text-blue-600 z-10" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-11 h-12 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 block">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 h-5 w-5 transition-colors group-focus-within:text-blue-600 z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-11 h-12 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700 block">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 h-5 w-5 transition-colors group-focus-within:text-blue-600 z-10" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-11 h-12 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all w-full"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full text-white font-semibold py-3 h-12 text-base shadow-lg hover:shadow-xl transition-all duration-200 mt-6 flex items-center justify-center"
              style={{
                background: 'linear-gradient(to right, #2563eb, #1d4ed8)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #1e40af)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #1d4ed8)'
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                <>
                  Sign Up
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center px-8 pt-4 pb-8">
          <div className="text-sm text-center text-gray-600 w-full">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
