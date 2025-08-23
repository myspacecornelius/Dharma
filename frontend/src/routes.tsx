import { lazy, Suspense } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

const AppShell = lazy(() => import('./layouts/AppShell'))
const FeedPage = lazy(() => import('./pages/FeedPage'))
const HeatCheckPage = lazy(() => import('./pages/HeatCheckPage'))
const DropZonesPage = lazy(() => import('./pages/DropZonesPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const ProtectedRoute = lazy(() => import('./auth/ProtectedRoute'))

const AppRoutes = () => (
    <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
            <Switch>
                <Route path="/login" component={LoginPage} />
                <Route path="/" component={AppShell} />
            </Switch>
        </Suspense>
    </BrowserRouter>
);

export default AppRoutes;
