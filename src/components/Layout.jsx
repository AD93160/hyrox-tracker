import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Layout.module.css'

export default function Layout({ children }) {
  const { user, logout } = useAuth()

  return (
    <div className={styles.wrapper}>
      <nav className={styles.nav}>
        <span className={styles.brand}>Hyrox Tracker</span>
        <NavLink
          to="/chrono"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.linkActive}` : styles.link
          }
        >
          Chrono
        </NavLink>
        <NavLink
          to="/sessions"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.linkActive}` : styles.link
          }
        >
          Sessions
        </NavLink>
        <NavLink
          to="/progress"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.linkActive}` : styles.link
          }
        >
          Progression
        </NavLink>
        {user && (
          <button className={styles.logoutBtn} onClick={logout}>
            Déconnexion
          </button>
        )}
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
