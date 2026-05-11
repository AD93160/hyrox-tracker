import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useAuth } from '../hooks/useAuth'
import { getUserSessions } from '../firebase/sessions'
import { formatTime } from '../utils/phases'
import styles from './ProgressPage.module.css'

function formatDate(timestamp) {
  if (!timestamp) return '—'
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

export default function ProgressPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserSessions(user.uid).then((data) => {
      setSessions(data.reverse())
      setLoading(false)
    })
  }, [user.uid])

  if (loading) return <p className={styles.loading}>Chargement…</p>

  if (sessions.length === 0) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Progression</h1>
        <p className={styles.empty}>Pas encore assez de données.</p>
      </div>
    )
  }

  const chartData = sessions.map((s) => ({
    date: formatDate(s.date),
    totalMin: +(s.totalTime / 60).toFixed(1),
  }))

  const best = Math.min(...sessions.map((s) => s.totalTime))
  const avg = sessions.reduce((a, s) => a + s.totalTime, 0) / sessions.length

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
              <XAxis dataKey="date" tick={{ fill: '#8b949e', fontSize: 12 }} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: 8,
                }}
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
    </div>
  )
}
