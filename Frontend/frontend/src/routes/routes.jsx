import { createBrowserRouter } from 'react-router-dom'
import Dashboard from '../pages/dashboard/Dashboard'
import Diet from '../pages/diet/Diet'
import Sleep from '../pages/sleep/Sleep'
import Water from '../pages/water/Water'
import Medication from '../pages/medication/Medication'
import AI from '../pages/ai/AI'
import Login from '../pages/auth/Login'
import Signup from '../pages/auth/Signup'

export const router = createBrowserRouter([
  {
    path: '/',
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
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
])

