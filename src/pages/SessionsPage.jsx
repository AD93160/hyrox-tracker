import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getUserSessions, deleteSession, updateSession } from '../firebase/sessions'
import { formatTime, formatDate } from '../utils/phases'
import styles from './SessionsPage.module.css'

function parseTimeInput(str) {
  const parts = String(str).trim().split(':')
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10)
    const s = parseInt(parts[1], 10)
    if (!isNaN(m) && !isNaN(s) && s < 60) return m * 60 + s
  }
  const n = parseInt(str, 10)
  return isNaN(n) || n < 0 ? 0 : n
}

function TimeInput({ value, onChange }) {
  const [raw, setRaw] = useState(formatTime(value || 0))

  function handleBlur() {
    const secs = parseTimeInput(raw)
    onChange(secs)
    setRaw(formatTime(secs))
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      className={styles.timeEditInput}
      value={raw}
      onChange={e => setRaw(e.target.value)}
      onBlur={handleBlur}
      placeholder="00:00"
    />
  )
}

export default function SessionsPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editPhases, setEditPhases] = useState([])
  const [editSaving, setEditSaving] = useState(false)

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

  function startEdit(session) {
    setEditingId(session.id)
    setEditPhases(session.phases.map(p => ({ ...p })))
  }

  function cancelEdit() {
    setEditingId(null)
    setEditPhases([])
  }

  async function saveEdit(sessionId) {
    setEditSaving(true)
    try {
      await updateSession(sessionId, editPhases)
      const newTotal = editPhases.reduce((s, p) => s + (p.time || 0) + (p.transitionTime || 0), 0)
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, phases: editPhases, totalTime: newTotal } : s
      ))
      setEditingId(null)
    } catch {
      // keep edit open on error
    } finally {
      setEditSaving(false)
    }
  }

  function updateEditPhase(idx, field, value) {
    setEditPhases(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p))
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mes sessions</h1>

      {loading && <p className={styles.loading}>Chargement…</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && sessions.length === 0 && (
        <p className={styles.empty}>Aucune session enregistrée.</p>
      )}

      {sessions.map((session) => {
        const isEditing = editingId === session.id
        const displayPhases = isEditing ? editPhases : session.phases
        const totalTransition = displayPhases?.reduce((s, p) => s + (p.transitionTime || 0), 0) ?? 0

        return (
          <div key={session.id} className={`${styles.card} ${isEditing ? styles.cardEditing : ''}`}>
            <div className={styles.cardHeader}>
              <span className={styles.date}>{formatDate(session.date)}</span>
              <div className={styles.timesGroup}>
                <span className={styles.totalTime}>{formatTime(session.totalTime)}</span>
                {totalTransition > 0 && (
                  <span className={styles.transitionBadge}>
                    ↕ {formatTime(totalTransition)}
                  </span>
                )}
              </div>
              <div className={styles.cardActions}>
                {!isEditing ? (
                  <>
                    <button className={styles.editBtn} onClick={() => startEdit(session)}>
                      Modifier
                    </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(session.id)}>
                      Supprimer
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={styles.saveEditBtn}
                      onClick={() => saveEdit(session.id)}
                      disabled={editSaving}
                    >
                      {editSaving ? '…' : 'Sauvegarder'}
                    </button>
                    <button className={styles.cancelEditBtn} onClick={cancelEdit}>
                      Annuler
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className={styles.phases}>
              {displayPhases?.map((phase, idx) => (
                <div key={phase.id}>
                  {phase.transitionTime > 0 && (
                    <div className={styles.transitionItem}>
                      <span className={styles.transitionItemLabel}>↕ transition</span>
                      <span className={styles.transitionItemTime}>{formatTime(phase.transitionTime)}</span>
                    </div>
                  )}
                  <div className={`${styles.phaseItem} ${isEditing ? styles.phaseItemEdit : ''}`}>
                    <span className={styles.phaseItemLabel}>{phase.label}</span>
                    {isEditing ? (
                      <>
                        <TimeInput
                          value={phase.time}
                          onChange={val => updateEditPhase(idx, 'time', val)}
                        />
                        {phase.weightable && (
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            inputMode="decimal"
                            className={styles.weightEditInput}
                            value={phase.weight || ''}
                            onChange={e => updateEditPhase(idx, 'weight', e.target.value)}
                            placeholder="0"
                          />
                        )}
                        {phase.weightable && (
                          <span className={styles.phaseEditUnit}>kg</span>
                        )}
                      </>
                    ) : (
                      <>
                        {phase.weight && (
                          <span className={styles.phaseItemWeight}>{phase.weight} kg</span>
                        )}
                        <span className={styles.phaseItemTime}>{formatTime(phase.time)}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {session.notes && <p className={styles.notes}>{session.notes}</p>}
          </div>
        )
      })}
    </div>
  )
}
