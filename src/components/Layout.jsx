import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Layout.module.css'

function ChronoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="13" r="8" />
      <polyline points="12 9 12 13 14.5 15.5" />
      <path d="M9 3h6M12 3v2" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()

  const navLinkClass = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.linkActive}` : styles.link

  const bottomLinkClass = ({ isActive }) =>
    isActive ? `${styles.bottomLink} ${styles.bottomLinkActive}` : styles.bottomLink

  return (
    <div className={styles.wrapper}>
      <nav className={styles.nav}>
        <span className={styles.brand}>Hyrox Tracker</span>

        {/* Desktop links */}
        <span className={styles.navLinks}>
          <NavLink to="/chrono" className={navLinkClass}>Chrono</NavLink>
          <NavLink to="/sessions" className={navLinkClass}>Sessions</NavLink>
          <NavLink to="/progress" className={navLinkClass}>Progression</NavLink>
        </span>

        {user && (
          <button className={styles.logoutBtn} onClick={logout}>
            Déconnexion
          </button>
        )}
      </nav>

      <main className={styles.main}>{children}</main>

      {/* Mobile bottom tab bar */}
      <nav className={styles.bottomNav} aria-label="Navigation principale">
        <NavLink to="/chrono" className={bottomLinkClass}>
          <ChronoIcon />
          Chrono
        </NavLink>
        <NavLink to="/sessions" className={bottomLinkClass}>
          <ListIcon />
          Sessions
        </NavLink>
        <NavLink to="/progress" className={bottomLinkClass}>
          <ChartIcon />
          Progression
        </NavLink>
      </nav>
    </div>
  )
}
