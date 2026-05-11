export const PHASES = [
  { id: 'run1',      label: 'Run 1',             type: 'run',     target: '1 km',    weightable: false },
  { id: 'skierg',    label: 'SkiErg',             type: 'station', target: '1000 m',  weightable: false },
  { id: 'run2',      label: 'Run 2',              type: 'run',     target: '1 km',    weightable: false },
  { id: 'sled_push', label: 'Sled Push',          type: 'station', target: '50 m',    weightable: true,  weightLabel: 'Charge' },
  { id: 'run3',      label: 'Run 3',              type: 'run',     target: '1 km',    weightable: false },
  { id: 'sled_pull', label: 'Sled Pull',          type: 'station', target: '50 m',    weightable: true,  weightLabel: 'Charge' },
  { id: 'run4',      label: 'Run 4',              type: 'run',     target: '1 km',    weightable: false },
  { id: 'burpee',    label: 'Burpee Broad Jump',  type: 'station', target: '80 m',    weightable: false },
  { id: 'run5',      label: 'Run 5',              type: 'run',     target: '1 km',    weightable: false },
  { id: 'rowing',    label: 'Rowing',             type: 'station', target: '1000 m',  weightable: false },
  { id: 'run6',      label: 'Run 6',              type: 'run',     target: '1 km',    weightable: false },
  { id: 'farmers',   label: 'Farmers Carry',      type: 'station', target: '200 m',   weightable: true,  weightLabel: 'Par main' },
  { id: 'run7',      label: 'Run 7',              type: 'run',     target: '1 km',    weightable: false },
  { id: 'lunges',    label: 'Sandbag Lunges',     type: 'station', target: '100 m',   weightable: true,  weightLabel: 'Sac' },
  { id: 'run8',      label: 'Run 8',              type: 'run',     target: '1 km',    weightable: false },
  { id: 'wallball',  label: 'Wall Balls',         type: 'station', target: '100 reps',weightable: true,  weightLabel: 'Balle' },
]

export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatDate(timestamp) {
  if (!timestamp) return '—'
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

// km/h → "MM:SS /km"
export function kmhToMinPkm(kmh) {
  if (!kmh || kmh <= 0) return ''
  const total = 60 / kmh
  const min = Math.floor(total)
  const sec = Math.round((total - min) * 60)
  return `${min}:${String(sec).padStart(2, '0')}`
}

// "MM:SS" → km/h (returns null if invalid)
export function minPkmToKmh(str) {
  const parts = str.trim().split(':')
  if (parts.length !== 2) return null
  const min = parseInt(parts[0], 10)
  const sec = parseInt(parts[1], 10)
  if (isNaN(min) || isNaN(sec) || sec >= 60) return null
  const minPerKm = min + sec / 60
  if (minPerKm <= 0) return null
  return 60 / minPerKm
}

// Affiche la vitesse selon l'unité choisie
export function formatSpeed(kmh, unit) {
  if (!kmh || kmh <= 0) return '—'
  if (unit === 'minpkm') return `${kmhToMinPkm(kmh)} /km`
  return `${parseFloat(kmh).toFixed(1)} km/h`
}
