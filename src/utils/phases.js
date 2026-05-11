export const PHASES = [
  { id: 'run1',    label: 'Run 1',              type: 'run',     target: '1 km' },
  { id: 'skierg',  label: 'SkiErg',             type: 'station', target: '1000 m' },
  { id: 'run2',    label: 'Run 2',              type: 'run',     target: '1 km' },
  { id: 'sled_push', label: 'Sled Push',        type: 'station', target: '50 m' },
  { id: 'run3',    label: 'Run 3',              type: 'run',     target: '1 km' },
  { id: 'sled_pull', label: 'Sled Pull',        type: 'station', target: '50 m' },
  { id: 'run4',    label: 'Run 4',              type: 'run',     target: '1 km' },
  { id: 'burpee',  label: 'Burpee Broad Jump',  type: 'station', target: '80 m' },
  { id: 'run5',    label: 'Run 5',              type: 'run',     target: '1 km' },
  { id: 'rowing',  label: 'Rowing',             type: 'station', target: '1000 m' },
  { id: 'run6',    label: 'Run 6',              type: 'run',     target: '1 km' },
  { id: 'farmers', label: 'Farmers Carry',      type: 'station', target: '200 m' },
  { id: 'run7',    label: 'Run 7',              type: 'run',     target: '1 km' },
  { id: 'lunges',  label: 'Sandbag Lunges',     type: 'station', target: '100 m' },
  { id: 'run8',    label: 'Run 8',              type: 'run',     target: '1 km' },
  { id: 'wallball', label: 'Wall Balls',        type: 'station', target: '100 reps' },
]

export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
