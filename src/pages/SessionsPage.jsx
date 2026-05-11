import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getUserSessions, deleteSession } from '../firebase/sessions'
import { formatTime, formatDate } from '../utils/phases'
import styles from './SessionsPage.module.css'

export default function SessionsPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getUserSessions(user.uid)
      .then((data) => {
        setSessions(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('getUserSessions:', err)
        setError('Impossible de charger les sessions. Vérifiez vos règles Firestore.')
        setLoading(false)
      })
  }, [user.uid])

  async function handleDelete(id) {
    await deleteSession(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mes sessions</h1>

      {loading && <p className={styles.loading}>Chargement…</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && sessions.length === 0 && (
        <p className={styles.empty}>Aucune session enregistrée.</p>
      )}

      {sessions.map((session) => (
        <div key={session.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.date}>{formatDate(session.date)}</span>
            <span className={styles.totalTime}>{formatTime(session.totalTime)}</span>
            <button className={styles.deleteBtn} onClick={() => handleDelete(session.id)}>
              Supprimer
            </button>
          </div>

          <div className={styles.phases}>
            {session.phases?.map((phase) => (
              <div key={phase.id} className={styles.phaseItem}>
                <span className={styles.phaseItemLabel}>{phase.label}</span>
                {phase.weight && (
                  <span className={styles.phaseItemWeight}>{phase.weight} kg</span>
                )}
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
