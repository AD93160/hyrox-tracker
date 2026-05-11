import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useAuth } from '../hooks/useAuth'
import { getUserSessions } from '../firebase/sessions'
import { PHASES, formatTime, formatDate } from '../utils/phases'
import styles from './ProgressPage.module.css'

export default function ProgressPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [compareA, setCompareA] = useState('')
  const [compareB, setCompareB] = useState('')

  useEffect(() => {
    getUserSessions(user.uid).then((data) => {
      const sorted = [...data].reverse()
      setSessions(sorted)
      if (sorted.length >= 2) {
        setCompareA(sorted[sorted.length - 2].id)
        setCompareB(sorted[sorted.length - 1].id)
      } else if (sorted.length === 1) {
        setCompareA(sorted[0].id)
      }
      setLoading(false)
    })
  }, [user.uid])

  if (loading) return <p className={styles.loading}>Chargement…</p>

  if (sessions.length === 0) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Progression</h1>
        <p className={styles.empty}>Enregistrez votre première session pour voir vos stats.</p>
      </div>
    )
  }

  const chartData = sessions.map(s => ({
    date: formatDate(s.date),
    totalMin: +(s.totalTime / 60).toFixed(1),
  }))

  const best = Math.min(...sessions.map(s => s.totalTime))
  const avg = sessions.reduce((a, s) => a + s.totalTime, 0) / sessions.length

  const sessionA = sessions.find(s => s.id === compareA)
  const sessionB = sessions.find(s => s.id === compareB)

  function diffLabel(timeA, timeB) {
    if (!timeA || !timeB || timeA === 0) return null
    const pct = ((timeB - timeA) / timeA) * 100
    const sign = pct < 0 ? '' : '+'
    return { pct, label: `${sign}${pct.toFixed(1)} %` }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Progression</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{sessions.length}</div>
          <div className={styles.statLabel}>Sessions</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatTime(best)}</div>
          <div className={styles.statLabel}>Meilleur temps</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatTime(Math.round(avg))}</div>
          <div className={styles.statLabel}>Temps moyen</div>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Temps total (minutes)</p>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#30363d" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#8b949e', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8 }}
                labelStyle={{ color: '#e6edf3' }}
                itemStyle={{ color: '#e63946' }}
              />
              <Line
                type="monotone"
                dataKey="totalMin"
                stroke="#e63946"
                strokeWidth={2}
                dot={{ fill: '#e63946', r: 4 }}
                activeDot={{ r: 6 }}
                name="Total (min)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {sessions.length >= 2 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Comparer deux sessions</p>

          <div className={styles.compareSelectors}>
            <div className={styles.selectorGroup}>
              <label className={styles.selectorLabel}>Session A</label>
              <select
                className={styles.selector}
                value={compareA}
                onChange={e => setCompareA(e.target.value)}
              >
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>{formatDate(s.date)} — {formatTime(s.totalTime)}</option>
                ))}
              </select>
            </div>
            <div className={styles.selectorGroup}>
              <label className={styles.selectorLabel}>Session B</label>
              <select
                className={styles.selector}
                value={compareB}
                onChange={e => setCompareB(e.target.value)}
              >
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>{formatDate(s.date)} — {formatTime(s.totalTime)}</option>
                ))}
              </select>
            </div>
          </div>

          {sessionA && sessionB && compareA !== compareB && (
            <div className={styles.compareTable}>
              <div className={`${styles.compareRow} ${styles.compareHeader}`}>
                <span className={styles.comparePhase}>Phase</span>
                <span className={styles.compareTime}>A</span>
                <span className={styles.compareTime}>B</span>
                <span className={styles.compareDiff}>Évolution</span>
              </div>

              {(() => {
                const d = diffLabel(sessionA.totalTime, sessionB.totalTime)
                return (
                  <div className={`${styles.compareRow} ${styles.compareTotalRow}`}>
                    <span className={styles.comparePhase}>Total</span>
                    <span className={styles.compareTime}>{formatTime(sessionA.totalTime)}</span>
                    <span className={styles.compareTime}>{formatTime(sessionB.totalTime)}</span>
                    <span className={`${styles.compareDiff} ${d ? (d.pct < 0 ? styles.improved : styles.slower) : ''}`}>
                      {d ? d.label : '—'}
                    </span>
                  </div>
                )
              })()}

              {PHASES.map((phase, i) => {
                const tA = sessionA.phases?.[i]?.time
                const tB = sessionB.phases?.[i]?.time
                const d = diffLabel(tA, tB)
                return (
                  <div key={phase.id} className={styles.compareRow}>
                    <span className={styles.comparePhase}>{phase.label}</span>
                    <span className={styles.compareTime}>{tA ? formatTime(tA) : '—'}</span>
                    <span className={styles.compareTime}>{tB ? formatTime(tB) : '—'}</span>
                    <span className={`${styles.compareDiff} ${d ? (d.pct < 0 ? styles.improved : styles.slower) : ''}`}>
                      {d ? d.label : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {compareA === compareB && (
            <p className={styles.compareHint}>Sélectionnez deux sessions différentes.</p>
          )}
        </div>
      )}
    </div>
  )
}
