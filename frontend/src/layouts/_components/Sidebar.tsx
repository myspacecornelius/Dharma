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
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
                      isActive && 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50',
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
