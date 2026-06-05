import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.tsx'

type NavbarProps = {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'GH'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-surface-elevated px-4 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex size-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-surface-muted hover:text-text-primary lg:hidden"
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>

      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
          <GarageIcon />
        </span>
        <span className="text-lg font-semibold tracking-tight">GarageHub</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {user ? (
          <>
            <span className="hidden text-sm text-text-secondary sm:inline">
              Welcome, <span className="text-text-primary">{user.email}</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-muted hover:text-text-primary sm:inline"
            >
              Log out
            </button>
            <div
              className="flex size-8 items-center justify-center rounded-full bg-surface-muted text-xs font-medium text-accent"
              title={user.email}
            >
              {initials}
            </div>
          </>
        ) : (
          <span className="text-sm text-text-secondary">Not signed in</span>
        )}
      </div>
    </header>
  )
}

function MenuIcon() {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function GarageIcon() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  )
}
