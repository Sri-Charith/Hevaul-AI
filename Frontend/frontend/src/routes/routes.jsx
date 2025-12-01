import { createBrowserRouter, Outlet } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import PublicRoute from '../components/PublicRoute.jsx'
import MainLayout from '../components/MainLayout.jsx'
import Landing from '../pages/Landing.jsx'
import Dashboard from '../pages/dashboard/Dashboard.jsx'
import Diet from '../pages/diet/Diet.jsx'
import Sleep from '../pages/sleep/Sleep.jsx'
import Water from '../pages/water/Water.jsx'
import Medication from '../pages/medication/Medication.jsx'
import AI from '../pages/ai/AI.jsx'
import Login from '../pages/auth/Login.jsx'
import Signup from '../pages/auth/Signup.jsx'
import Profile from '../pages/Profile.jsx'

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
    element: (
      <ProtectedRoute>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/diet',
        element: <Diet />,
      },
      {
        path: '/sleep',
        element: <Sleep />,
      },
      {
        path: '/water',
        element: <Water />,
      },
      {
        path: '/medication',
        element: <Medication />,
      },
      {
        path: '/ai',
        element: <AI />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
    ],
  },
])

