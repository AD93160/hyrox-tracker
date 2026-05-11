import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { saveSession } from '../firebase/sessions'
import { PHASES, formatTime } from '../utils/phases'
import styles from './ChronoPage.module.css'

const initialPhases = () => PHASES.map((p) => ({ ...p, time: 0 }))

export default function ChronoPage() {
  const { user } = useAuth()
  const [phases, setPhases] = useState(initialPhases)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const intervalRef = useRef(null)

  const tick = useCallback(() => {
    setPhases((prev) =>
      prev.map((p, i) => (i === currentIdx ? { ...p, time: p.time + 1 } : p))
    )
  }, [currentIdx])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, tick])

  function handleStartStop() {
    if (finished) return
    setRunning((r) => !r)
  }

  function handleNext() {
    if (currentIdx >= PHASES.length - 1) {
      setRunning(false)
      setFinished(true)
      return
    }
    setCurrentIdx((i) => i + 1)
  }

  function handleReset() {
    setRunning(false)
    setFinished(false)
    setCurrentIdx(0)
    setPhases(initialPhases())
    setNotes('')
    setSaved(false)
  }

  async function handleSave() {
    await saveSession(user.uid, phases, notes)
    setSaved(true)
  }

  const totalTime = phases.reduce((s, p) => s + p.time, 0)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chronomètre</h1>
        <span className={styles.totalTime}>{formatTime(totalTime)}</span>
      </div>

      <div className={styles.controls}>
        {!finished && (
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleStartStop}
          >
            {running ? 'Pause' : 'Démarrer'}
          </button>
        )}
        {running && currentIdx < PHASES.length - 1 && (
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={handleNext}
          >
            Phase suivante →
          </button>
        )}
        {running && currentIdx === PHASES.length - 1 && (
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={handleNext}
          >
            Terminer
          </button>
        )}
        <button
          className={`${styles.btn} ${styles.btnDanger}`}
          onClick={handleReset}
        >
          Réinitialiser
        </button>
      </div>

      <div>
        {phases.map((phase, i) => (
          <div
            key={phase.id}
            className={`${styles.phaseCard} ${i === currentIdx && !finished ? styles.active : ''} ${i < currentIdx ? styles.done : ''}`}
          >
            <span className={`${styles.phaseBadge} ${styles[phase.type]}`}>
              {phase.type === 'run' ? 'Run' : 'Station'}
            </span>
            <span className={styles.phaseLabel}>{phase.label}</span>
            <span className={styles.phaseTarget}>{phase.target}</span>
            <span className={styles.phaseTime}>{formatTime(phase.time)}</span>
          </div>
        ))}
      </div>

      {finished && (
        <>
          <textarea
            className={styles.notes}
            placeholder="Notes sur la session (optionnel)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {!saved ? (
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleSave}
            >
              Sauvegarder la session
            </button>
          ) : (
            <p className={styles.saved}>Session sauvegardée ✓</p>
          )}
        </>
      )}
    </div>
  )
}
