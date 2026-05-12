import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { AVATARS } from '../firebase/profile'
import styles from './Layout.module.css'

function AvatarBubble({ avatarId, size = 28 }) {
  const av = AVATARS.find(a => a.id === avatarId) ?? AVATARS[0]
  return (
    <span
      className={styles.avatarBubble}
      style={{ background: av.bg, width: size, height: size, fontSize: size * 0.52 }}
    >
      {av.emoji}
    </span>
  )
}

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

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const { profile } = useProfile()
  const [showGreeting, setShowGreeting] = useState(false)

  const pseudo = profile?.pseudo?.trim() ?? ''

  useEffect(() => {
    if (!pseudo) return
    if (sessionStorage.getItem('hyrox_greeted')) return
    setShowGreeting(true)
    sessionStorage.setItem('hyrox_greeted', '1')
    const t = setTimeout(() => setShowGreeting(false), 3500)
    return () => clearTimeout(t)
  }, [pseudo])

  const navLinkClass = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.linkActive}` : styles.link

  const bottomLinkClass = ({ isActive }) =>
    isActive ? `${styles.bottomLink} ${styles.bottomLinkActive}` : styles.bottomLink

  return (
    <div className={styles.wrapper}>
      {showGreeting && (
        <div className={styles.greetingToast}>
          <AvatarBubble avatarId={profile?.avatarId} size={26} />
          Bonjour,&nbsp;<strong>{pseudo}</strong>&nbsp;!
        </div>
      )}

      <nav className={styles.nav}>
        <span className={styles.brand}>Hyrox Tracker</span>
        <span className={styles.navLinks}>
          <NavLink to="/chrono"   className={navLinkClass}>Chrono</NavLink>
          <NavLink to="/sessions" className={navLinkClass}>Sessions</NavLink>
          <NavLink to="/progress" className={navLinkClass}>Progression</NavLink>
          <NavLink to="/settings" className={navLinkClass}>Réglages</NavLink>
        </span>
        {user && (
          <div className={styles.userArea}>
            {pseudo && (
              <span className={styles.pseudoChip}>
                <AvatarBubble avatarId={profile?.avatarId} size={22} />
                <span className={styles.pseudoText}>{pseudo}</span>
              </span>
            )}
            <button className={styles.logoutBtn} onClick={logout}>Déconnexion</button>
          </div>
        )}
      </nav>

      <main className={styles.main}>{children}</main>

      <nav className={styles.bottomNav} aria-label="Navigation principale">
        <NavLink to="/chrono"   className={bottomLinkClass}><ChronoIcon />Chrono</NavLink>
        <NavLink to="/sessions" className={bottomLinkClass}><ListIcon />Sessions</NavLink>
        <NavLink to="/progress" className={bottomLinkClass}><ChartIcon />Progression</NavLink>
        <NavLink to="/settings" className={bottomLinkClass}><GearIcon />Réglages</NavLink>
      </nav>
    </div>
  )
}
