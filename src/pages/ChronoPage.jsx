import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { saveSession } from '../firebase/sessions'
import { PHASES, formatTime } from '../utils/phases'
import styles from './ChronoPage.module.css'

const initPhases = () => PHASES.map(p => ({ ...p, time: 0, weight: '' }))

export default function ChronoPage() {
  const { user } = useAuth()
  const [phases, setPhases] = useState(initPhases)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [globalTime, setGlobalTime] = useState(0)
  const [globalRunning, setGlobalRunning] = useState(false)
  const [phaseRunning, setPhaseRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const phaseRunningRef = useRef(false)
  const currentIdxRef = useRef(0)

  useEffect(() => {
    if (!globalRunning) return
    const id = setInterval(() => {
      setGlobalTime(t => t + 1)
      if (phaseRunningRef.current) {
        const idx = currentIdxRef.current
        setPhases(prev =>
          prev.map((p, i) => i === idx ? { ...p, time: p.time + 1 } : p)
        )
      }
    }, 1000)
    return () => clearInterval(id)
  }, [globalRunning])

  const sessionStarted = globalRunning || globalTime > 0
  const currentPhase = phases[currentIdx]
  const isLastPhase = currentIdx === PHASES.length - 1

  function handleStart() {
    phaseRunningRef.current = true
    setPhaseRunning(true)
    setGlobalRunning(true)
  }

  function handleTogglePhase() {
    setPhaseRunning(r => {
      phaseRunningRef.current = !r
      return !r
    })
  }

  function handleNext() {
    phaseRunningRef.current = false
    setPhaseRunning(false)
    setCurrentIdx(i => {
      const next = i + 1
      currentIdxRef.current = next
      return next
    })
  }

  function handleFinish() {
    setGlobalRunning(false)
    phaseRunningRef.current = false
    setPhaseRunning(false)
    setFinished(true)
  }

  function handleReset() {
    setGlobalRunning(false)
    phaseRunningRef.current = false
    setPhaseRunning(false)
    setFinished(false)
    setCurrentIdx(0)
    currentIdxRef.current = 0
    setGlobalTime(0)
    setPhases(initPhases())
    setNotes('')
    setSaved(false)
    setSaveError('')
  }

  function handleWeight(idx, value) {
    setPhases(prev => prev.map((p, i) => i === idx ? { ...p, weight: value } : p))
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    try {
      await saveSession(user.uid, phases, notes, globalTime)
      setSaved(true)
    } catch {
      setSaveError('Sauvegarde échouée. Vérifiez votre connexion et réessayez.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chronomètre</h1>
        <span className={`${styles.totalTime} ${globalRunning ? styles.totalTimeRunning : ''}`}>
          {formatTime(globalTime)}
        </span>
      </div>

      {!finished && (
        <div className={`${styles.focusCard} ${phaseRunning ? styles.focusRunning : ''}`}>
          <div className={styles.focusMeta}>
            <span className={`${styles.badge} ${styles[currentPhase.type]}`}>
              {currentPhase.type === 'run' ? 'Run' : 'Station'}
            </span>
            <span className={styles.focusStep}>{currentIdx + 1} / {PHASES.length}</span>
          </div>
          <div className={styles.focusName}>{currentPhase.label}</div>
          <div className={styles.focusTarget}>{currentPhase.target}</div>
          <div className={styles.focusTimer}>{formatTime(currentPhase.time)}</div>

          {currentPhase.weightable && (
            <div className={styles.weightRow}>
              <span className={styles.weightLabel}>{currentPhase.weightLabel} :</span>
              <input
                type="number"
                min="0"
                step="0.5"
                inputMode="decimal"
                className={styles.weightInput}
                value={currentPhase.weight}
                onChange={e => handleWeight(currentIdx, e.target.value)}
                placeholder="0"
              />
              <span className={styles.weightUnit}>kg</span>
            </div>
          )}
        </div>
      )}

      {!finished && (
        <div className={styles.controls}>
          {!sessionStarted ? (
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleStart}>
              Démarrer
            </button>
          ) : (
            <button
              className={`${styles.btn} ${phaseRunning ? styles.btnSecondary : styles.btnPrimary}`}
              onClick={handleTogglePhase}
            >
              {phaseRunning ? 'Pause phase' : currentPhase.time === 0 ? 'Démarrer la phase' : 'Reprendre'}
            </button>
          )}

          {sessionStarted && !isLastPhase && (
            <button className={`${styles.btn} ${styles.btnNext}`} onClick={handleNext}>
              Phase suivante →
            </button>
          )}

          {sessionStarted && isLastPhase && (
            <button className={`${styles.btn} ${styles.btnNext}`} onClick={handleFinish}>
              Terminer ✓
            </button>
          )}

          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleReset}>
            Réinitialiser
          </button>
        </div>
      )}

      {finished && (
        <div className={styles.saveSection}>
          <div className={styles.saveSummary}>
            <span>Temps total</span>
            <strong className={styles.saveTotalTime}>{formatTime(globalTime)}</strong>
          </div>
          <textarea
            className={styles.notes}
            placeholder="Commentaires, conditions, sensations… (optionnel)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          {!saved ? (
            <>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Sauvegarde en cours…' : 'Sauvegarder la session'}
              </button>
              {saveError && <p className={styles.saveError}>{saveError}</p>}
            </>
          ) : (
            <p className={styles.savedMsg}>Session sauvegardée ✓</p>
          )}
          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleReset}>
            Nouvelle session
          </button>
        </div>
      )}

      <div className={styles.phaseList}>
        <p className={styles.phaseListTitle}>Toutes les phases</p>
        {phases.map((phase, i) => (
          <div
            key={phase.id}
            className={[
              styles.phaseRow,
              i === currentIdx && !finished ? styles.phaseRowActive : '',
              (i < currentIdx || finished) ? styles.phaseRowDone : '',
            ].filter(Boolean).join(' ')}
          >
            <span className={`${styles.phaseBadge} ${styles[phase.type]}`}>
              {phase.type === 'run' ? 'Run' : 'Stat.'}
            </span>
            <span className={styles.phaseRowLabel}>{phase.label}</span>
            <span className={styles.phaseRowTarget}>{phase.target}</span>
            {phase.weightable && phase.weight && (
              <span className={styles.phaseRowWeight}>{phase.weight} kg</span>
            )}
            <span className={styles.phaseRowTime}>
              {phase.time > 0 ? formatTime(phase.time) : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
