import { createBrowserRouter } from 'react-router-dom'
import { lazy } from 'react'

const AppShell = lazy(() => import('./layouts/AppShell'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Heatmap = lazy(() => import('./pages/Heatmap'))
const Laces = lazy(() => import('./pages/Laces'))
const Dropzones = lazy(() => import('./pages/Dropzones'))
const ThriftRoutes = lazy(() => import('./pages/ThriftRoutes'))
const Profile = lazy(() => import('./pages/Profile'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const ProtectedRoute = lazy(() => import('./auth/ProtectedRoute'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute><AppShell /></ProtectedRoute>,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'heatmap', element: <Heatmap /> },
      { path: 'laces', element: <Laces /> },
      { path: 'dropzones', element: <Dropzones /> },
      { path: 'thriftroutes', element: <ThriftRoutes /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
])

export default router
