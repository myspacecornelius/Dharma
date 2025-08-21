import { createContext, useContext, useEffect, useState } from "react"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: "light" | "dark" | "system"
  storageKey?: string
}

type ThemeProviderState = {
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "vite-ui-theme", ...props }: ThemeProviderProps) {
  const [theme, setTheme] = useState<
    "light" | "dark" | "system"
  >(() => (localStorage.getItem(storageKey) as "light" | "dark" | "system") || defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: "light" | "dark" | "system") => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
--- a/frontend/src/lib/cn.ts
+++ b/frontend/src/lib/cn.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
--- a/frontend/src/layouts/AppShell.tsx
+++ b/frontend/src/layouts/AppShell.tsx
import { Outlet } from 'react-router-dom'
import { Topbar } from './_components/Topbar'
import { Sidebar } from './_components/Sidebar'

const AppShell = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell
--- a/frontend/src/layouts/_components/Topbar.tsx
+++ b/frontend/src/layouts/_components/Topbar.tsx
import { Menu, Search } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUiStore } from '@/store/ui'

export const Topbar = () => {
  const { toggleSidebar } = useUiStore()

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-white dark:bg-gray-800 px-4 md:px-6">
      <Button variant="outline" size="icon" className="md:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full appearance-none bg-white dark:bg-gray-800 pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
--- a/frontend/src/layouts/_components/Sidebar.tsx
+++ b/frontend/src/layouts/_components/Sidebar.tsx
import { NavLink } from 'react-router-dom'
import { Home, Map, Zap, User, Droplets, Route } from 'lucide-react'
import { useUiStore } from '@/store/ui'
import { cn } from '@/lib/cn'

const links = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/heatmap', label: 'HeatMap', icon: Map },
  { to: '/laces', label: 'LACES', icon: Zap },
  { to: '/dropzones', label: 'DropZones', icon: Droplets },
  { to: '/thriftroutes', label: 'ThriftRoutes', icon: Route },
  { to: '/profile', label: 'Profile', icon: User },
]

export const Sidebar = () => {
  const { isSidebarOpen } = useUiStore()

  return (
    <aside
      className={cn(
        'relative hidden h-screen w-64 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 md:block',
        !isSidebarOpen && 'w-20',
      )}
    >
      <div className="p-4">
        <h1 className={cn('text-2xl font-bold', !isSidebarOpen && 'text-center')}>
          {isSidebarOpen ? 'Dharma' : 'D'}
        </h1>
      </div>
      <nav className="mt-4">
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-4 p-4 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
                    isActive && 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300',
                    !isSidebarOpen && 'justify-center',
                  )
                }
              >
                <link.icon className="h-5 w-5" />
                <span className={cn(!isSidebarOpen && 'hidden')}>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
--- a/frontend/src/routes.tsx
+++ b/frontend/src/routes.tsx
import { createBrowserRouter } from 'react-router-dom'
import { lazy } from 'react'

const AppShell = lazy(() => import('../layouts/AppShell'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Heatmap = lazy(() => import('../pages/Heatmap'))
const Laces = lazy(() => import('../pages/Laces'))
const Dropzones = lazy(() => import('../pages/Dropzones'))
const ThriftRoutes = lazy(() => import('../pages/ThriftRoutes'))
const Profile = lazy(() => import('../pages/Profile'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const NotFound = lazy(() => import('../pages/NotFound'))
const ProtectedRoute = lazy(() => import('../auth/ProtectedRoute'))

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
--- a/frontend/src/pages/Dashboard.tsx
+++ b/frontend/src/pages/Dashboard.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome back, User!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>HeatMap</CardTitle>
            <CardDescription>Visualize drop zones and hot spots.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => toast.info('Navigating to HeatMap...')}>View HeatMap</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>LACES</CardTitle>
            <CardDescription>Manage your laces and releases.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => toast.info('Navigating to LACES...')}>View Laces</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>DropZones</CardTitle>
            <CardDescription>Discover and manage drop zones.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => toast.info('Navigating to DropZones...')}>View DropZones</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
--- a/frontend/src/pages/Heatmap.tsx
+++ b/frontend/src/pages/Heatmap.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const Heatmap = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">HeatMap</h1>
        <p className="text-gray-500 dark:text-gray-400">Visualize drop zones and hot spots.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <Button className="mt-4" onClick={() => toast.success('Thanks for your patience!')}>Notify Me</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Heatmap
--- a/frontend/src/pages/Laces.tsx
+++ b/frontend/src/pages/Laces.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const Laces = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">LACES</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your laces and releases.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <Button className="mt-4" onClick={() => toast.success('Thanks for your patience!')}>Notify Me</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Laces
--- a/frontend/src/pages/Dropzones.tsx
+++ b/frontend/src/pages/Dropzones.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const Dropzones = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">DropZones</h1>
        <p className="text-gray-500 dark:text-gray-400">Discover and manage drop zones.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <Button className="mt-4" onClick={() => toast.success('Thanks for your patience!')}>Notify Me</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dropzones
--- a/frontend/src/pages/ThriftRoutes.tsx
+++ b/frontend/src/pages/ThriftRoutes.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const ThriftRoutes = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">ThriftRoutes</h1>
        <p className="text-gray-500 dark:text-gray-400">Find and share the best thrift routes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <Button className="mt-4" onClick={() => toast.success('Thanks for your patience!')}>Notify Me</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default ThriftRoutes
--- a/frontend/src/pages/Profile.tsx
+++ b/frontend/src/pages/Profile.tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const Profile = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your profile and settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This feature is under construction.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <Button className="mt-4" onClick={() => toast.success('Thanks for your patience!')}>Notify Me</Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default Profile
--- a/frontend/src/pages/LoginPage.tsx
+++ b/frontend/src/pages/LoginPage.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const LoginPage = () => {
  const navigate = useNavigate()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // TODO: Replace with actual auth logic
    console.log(values)
    localStorage.setItem('user', JSON.stringify(values))
    toast.success('Login successful!')
    navigate('/')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email and password to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="m@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <a href="#" className="text-sm text-gray-500 hover:underline">
              Forgot password?
            </a>
            <a href="#" className="text-sm text-gray-500 hover:underline">
              Sign up
            </a>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default LoginPage
--- a/frontend/src/pages/NotFound.tsx
+++ b/frontend/src/pages/NotFound.tsx
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center">
      <h1 className="text-9xl font-bold text-indigo-600">404</h1>
      <h2 className="mt-4 text-3xl font-bold">Page Not Found</h2>
      <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
        Sorry, the page you are looking for does not exist.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">Go to Dashboard</Link>
      </Button>
    </div>
  )
}

export default NotFound
--- a/frontend/src/auth/ProtectedRoute.tsx
+++ b/frontend/src/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'

// TODO: Replace with actual auth logic
const useAuth = () => {
  const user = localStorage.getItem('user')
  if (user) {
    return { isAuthenticated: true }
  }
  return { isAuthenticated: false }
}

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
--- a/frontend/src/store/ui.ts
+++ b/frontend/src/store/ui.ts
import { create } from 'zustand'

interface UiState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))
```