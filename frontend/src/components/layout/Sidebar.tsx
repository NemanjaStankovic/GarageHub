import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.tsx'

const customerNavItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/vehicles', label: 'Vehicles', end: false },
  { to: '/service-requests', label: 'Service Requests', end: false },
] as const

const mechanicNavItems = [
  { to: '/mechanic', label: 'Mechanic Dashboard', end: true },
] as const

const adminNavItems = [
  { to: '/admin', label: 'Admin Dashboard', end: true },
] as const

type SidebarProps = {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems =
    user?.role === 'Admin'
      ? adminNavItems
      : user?.role === 'Mechanic'
        ? mechanicNavItems
        : customerNavItems

  function handleLogout() {
    logout()
    onClose()
    navigate('/login')
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`fixed top-14 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface-elevated transition-transform duration-200 lg:static lg:top-auto lg:bottom-auto lg:z-auto lg:min-h-0 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-12 items-center border-b border-border px-4 lg:hidden">
          <span className="text-sm font-medium text-text-secondary">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex size-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted hover:text-text-primary"
            aria-label="Close menu"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {user && (
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs text-text-secondary">Welcome</p>
            <p className="truncate text-sm font-medium text-text-primary">{user.email}</p>
            <p className="text-xs text-text-secondary">{user.role}</p>
          </div>
        )}

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-text-secondary transition hover:bg-surface-muted hover:text-text-primary"
            >
              Log out
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                }`
              }
            >
              Sign in
            </NavLink>
          )}
        </nav>

        <div className="border-t border-border p-4">
          <p className="text-xs text-text-secondary">GarageHub v0.1</p>
        </div>
      </aside>
    </>
  )
}
