import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSettings } from '../hooks/useSettings'
import { saveSession } from '../firebase/sessions'
import { PHASES, formatTime, kmhToMinPkm, minPkmToKmh } from '../utils/phases'
import styles from './ChronoPage.module.css'

const initPhases = () => PHASES.map(p => ({ ...p, time: 0, transitionTime: 0, weight: '', speed: '' }))

// Input vitesse adapté à l'unité choisie
function SpeedInput({ value, onChange, unit }) {
  const [raw, setRaw] = useState(
    value ? (unit === 'kmh' ? String(value) : kmhToMinPkm(value)) : ''
  )

  function handleBlur() {
    if (!raw.trim()) { onChange(''); return }
    if (unit === 'kmh') {
      const v = parseFloat(raw)
      onChange(isNaN(v) || v <= 0 ? '' : v)
    } else {
      const kmh = minPkmToKmh(raw)
      onChange(kmh ?? '')
    }
  }

  return (
    <input
      type={unit === 'kmh' ? 'number' : 'text'}
      min={unit === 'kmh' ? '0' : undefined}
      step={unit === 'kmh' ? '0.1' : undefined}
      inputMode={unit === 'kmh' ? 'decimal' : 'text'}
      className={styles.speedInput}
      value={raw}
      onChange={e => setRaw(e.target.value)}
      onBlur={handleBlur}
      placeholder={unit === 'kmh' ? '10.5' : '5:42'}
    />
  )
}

export default function ChronoPage() {
  const { user } = useAuth()
  const { settings } = useSettings()
  const [phases, setPhases] = useState(initPhases)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [globalTime, setGlobalTime] = useState(0)
  const [active, setActive] = useState(false)       // interval tourne
  const [transitioning, setTransitioning] = useState(false)
  const [transitionDisplay, setTransitionDisplay] = useState(0)
  const [finished, setFinished] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const phaseActiveRef = useRef(false)
  const currentIdxRef = useRef(0)
  const transitionAccRef = useRef(0)

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      setGlobalTime(t => t + 1)
      if (phaseActiveRef.current) {
        setPhases(prev =>
          prev.map((p, i) => i === currentIdxRef.current ? { ...p, time: p.time + 1 } : p)
        )
      } else {
        transitionAccRef.current += 1
        setTransitionDisplay(t => t + 1)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [active])

  const currentPhase = phases[currentIdx]
  const isLastPhase = currentIdx === PHASES.length - 1
  const nextPhase = !isLastPhase ? PHASES[currentIdx + 1] : null

  function handleStart() {
    phaseActiveRef.current = true
    setActive(true)
  }

  function handleNext() {
    // Arrête le chrono de la phase, démarre la transition
    phaseActiveRef.current = false
    transitionAccRef.current = 0
    setTransitionDisplay(0)
    setTransitioning(true)
    setCurrentIdx(i => {
      const next = i + 1
      currentIdxRef.current = next
      return next
    })
  }

  function handleStartNextPhase() {
    // Enregistre le temps de transition sur la phase qui va démarrer
    const tTime = transitionAccRef.current
    const idx = currentIdxRef.current
    setPhases(prev => prev.map((p, i) => i === idx ? { ...p, transitionTime: tTime } : p))
    phaseActiveRef.current = true
    transitionAccRef.current = 0
    setTransitionDisplay(0)
    setTransitioning(false)
  }

  function handleFinish() {
    phaseActiveRef.current = false
    setActive(false)
    setTransitioning(false)
    setFinished(true)
  }

  function handleReset() {
    phaseActiveRef.current = false
    transitionAccRef.current = 0
    currentIdxRef.current = 0
    setActive(false)
    setTransitioning(false)
    setTransitionDisplay(0)
    setFinished(false)
    setCurrentIdx(0)
    setGlobalTime(0)
    setPhases(initPhases())
    setNotes('')
    setSaved(false)
    setSaveError('')
  }

  function handleWeight(idx, value) {
    setPhases(prev => prev.map((p, i) => i === idx ? { ...p, weight: value } : p))
  }

  function handleSpeed(idx, value) {
    setPhases(prev => prev.map((p, i) => i === idx ? { ...p, speed: value } : p))
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

  const runPhases = phases.filter(p => p.type === 'run')
  const weightablePhases = phases.filter(p => p.weightable)

  return (
    <div className={styles.page}>

      {/* Header — chrono global */}
      <div className={styles.header}>
        <h1 className={styles.title}>Chronomètre</h1>
        <span className={`${styles.totalTime} ${active ? styles.totalTimeRunning : ''}`}>
          {formatTime(globalTime)}
        </span>
      </div>

      {/* Carte phase en cours */}
      {!finished && !transitioning && (
        <div className={`${styles.focusCard} ${active ? styles.focusRunning : ''}`}>
          <div className={styles.focusMeta}>
            <span className={`${styles.badge} ${styles[currentPhase.type]}`}>
              {currentPhase.type === 'run' ? 'Run' : 'Station'}
            </span>
            <span className={styles.focusStep}>{currentIdx + 1} / {PHASES.length}</span>
          </div>
          <div className={styles.focusName}>{currentPhase.label}</div>
          <div className={styles.focusTarget}>{currentPhase.target}</div>
          <div className={styles.focusTimer}>{formatTime(currentPhase.time)}</div>
        </div>
      )}

      {/* Carte transition */}
      {!finished && transitioning && (
        <div className={styles.transitionCard}>
          <div className={styles.transitionLabel}>Transition</div>
          <div className={styles.transitionTimer}>{formatTime(transitionDisplay)}</div>
          <div className={styles.transitionNext}>
            Prochaine : <strong>{phases[currentIdx].label}</strong>
          </div>
        </div>
      )}

      {/* Contrôles */}
      {!finished && (
        <div className={styles.controls}>
          {!active && !transitioning && (
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleStart}>
              Démarrer
            </button>
          )}

          {active && !transitioning && !isLastPhase && (
            <button className={`${styles.btn} ${styles.btnNext}`} onClick={handleNext}>
              Phase suivante →
            </button>
          )}

          {active && !transitioning && isLastPhase && (
            <button className={`${styles.btn} ${styles.btnNext}`} onClick={handleFinish}>
              Terminer ✓
            </button>
          )}

          {transitioning && (
            <>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleStartNextPhase}>
                Démarrer {phases[currentIdx].label} →
              </button>
              {currentIdx === PHASES.length - 1 && (
                <button className={`${styles.btn} ${styles.btnNext}`} onClick={handleFinish}>
                  Terminer sans démarrer ✓
                </button>
              )}
            </>
          )}

          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleReset}>
            Réinitialiser
          </button>
        </div>
      )}

      {/* Écran de sauvegarde */}
      {finished && (
        <div className={styles.saveSection}>
          <div className={styles.saveSummary}>
            <span>Temps total</span>
            <strong className={styles.saveTotalTime}>{formatTime(globalTime)}</strong>
          </div>

          {/* Vitesses post-session */}
          <div className={styles.postSection}>
            <p className={styles.postTitle}>
              Vitesse de course
              <span className={styles.postUnit}>
                {settings.speedUnit === 'kmh' ? 'km/h' : 'min/km (MM:SS)'}
              </span>
            </p>
            {runPhases.map(phase => (
              <div key={phase.id} className={styles.postRow}>
                <span className={styles.postLabel}>{phase.label}</span>
                <span className={styles.postTime}>{formatTime(phase.time)}</span>
                <SpeedInput
                  value={phase.speed}
                  unit={settings.speedUnit}
                  onChange={val => handleSpeed(phases.indexOf(phase), val)}
                />
                <span className={styles.postUnit2}>
                  {settings.speedUnit === 'kmh' ? 'km/h' : '/km'}
                </span>
              </div>
            ))}
          </div>

          {/* Charges post-session */}
          {weightablePhases.length > 0 && (
            <div className={styles.postSection}>
              <p className={styles.postTitle}>Charges utilisées</p>
              {weightablePhases.map(phase => (
                <div key={phase.id} className={styles.postRow}>
                  <span className={styles.postLabel}>{phase.label}</span>
                  <span className={styles.postTime}>{formatTime(phase.time)}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    inputMode="decimal"
                    className={styles.weightInput}
                    value={phase.weight}
                    onChange={e => handleWeight(phases.indexOf(phase), e.target.value)}
                    placeholder="0"
                  />
                  <span className={styles.postUnit2}>kg</span>
                </div>
              ))}
            </div>
          )}

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

      {/* Liste de toutes les phases */}
      <div className={styles.phaseList}>
        <p className={styles.phaseListTitle}>Toutes les phases</p>
        {phases.map((phase, i) => (
          <div key={phase.id}>
            {/* Temps de transition avant cette phase */}
            {phase.transitionTime > 0 && (
              <div className={styles.transitionRow}>
                <span className={styles.transitionRowLabel}>↕ Transition</span>
                <span className={styles.transitionRowTime}>{formatTime(phase.transitionTime)}</span>
              </div>
            )}
            <div
              className={[
                styles.phaseRow,
                i === currentIdx && !finished && !transitioning ? styles.phaseRowActive : '',
                i === currentIdx && transitioning ? styles.phaseRowNext : '',
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
          </div>
        ))}
      </div>
    </div>
  )
}
