import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getUserSessions, deleteSession } from '../firebase/sessions'
import { formatTime } from '../utils/phases'
import styles from './SessionsPage.module.css'

export default function SessionsPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserSessions(user.uid).then((data) => {
      setSessions(data)
      setLoading(false)
    })
  }, [user.uid])

  async function handleDelete(id) {
    await deleteSession(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  function formatDate(timestamp) {
    if (!timestamp) return '—'
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mes sessions</h1>

      {loading && <p className={styles.loading}>Chargement…</p>}

      {!loading && sessions.length === 0 && (
        <p className={styles.empty}>Aucune session enregistrée.</p>
      )}

      {sessions.map((session) => (
        <div key={session.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.date}>{formatDate(session.date)}</span>
            <span className={styles.totalTime}>{formatTime(session.totalTime)}</span>
            <button
              className={styles.deleteBtn}
              onClick={() => handleDelete(session.id)}
            >
              Supprimer
            </button>
          </div>

          <div className={styles.phases}>
            {session.phases?.map((phase) => (
              <div key={phase.id} className={styles.phaseItem}>
                <span className={styles.phaseItemLabel}>{phase.label}</span>
                <span className={styles.phaseItemTime}>{formatTime(phase.time)}</span>
              </div>
            ))}
          </div>

          {session.notes && <p className={styles.notes}>{session.notes}</p>}
        </div>
      ))}
    </div>
  )
}
