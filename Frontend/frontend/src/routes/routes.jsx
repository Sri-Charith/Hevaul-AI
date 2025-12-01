import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import PublicRoute from '../components/PublicRoute.jsx'
import Landing from '../pages/Landing.jsx'
import Dashboard from '../pages/dashboard/Dashboard.jsx'
import Diet from '../pages/diet/Diet.jsx'
import Sleep from '../pages/sleep/Sleep.jsx'
import Water from '../pages/water/Water.jsx'
import Medication from '../pages/medication/Medication.jsx'
import AI from '../pages/ai/AI.jsx'
import Login from '../pages/auth/Login.jsx'
import Signup from '../pages/auth/Signup.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/diet',
    element: (
      <ProtectedRoute>
        <Diet />
      </ProtectedRoute>
    ),
  },
  {
    path: '/sleep',
    element: (
      <ProtectedRoute>
        <Sleep />
      </ProtectedRoute>
    ),
  },
  {
    path: '/water',
    element: (
      <ProtectedRoute>
        <Water />
      </ProtectedRoute>
    ),
  },
  {
    path: '/medication',
    element: (
      <ProtectedRoute>
        <Medication />
      </ProtectedRoute>
    ),
  },
  {
    path: '/ai',
    element: (
      <ProtectedRoute>
        <AI />
      </ProtectedRoute>
    ),
  },
])

