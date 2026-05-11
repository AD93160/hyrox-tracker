import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

const COLLECTION = 'sessions'

export async function saveSession(userId, phases, notes = '') {
  const totalTime = phases.reduce((sum, p) => sum + p.time, 0)
  return addDoc(collection(db, COLLECTION), {
    userId,
    phases,
    notes,
    totalTime,
    date: serverTimestamp(),
  })
}

export async function getUserSessions(userId) {
  // Pas de orderBy server-side pour éviter l'index composite Firestore
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId)
  )
  const snapshot = await getDocs(q)
  const sessions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))

  // Tri côté client : du plus récent au plus ancien
  return sessions.sort((a, b) => {
    const tA = a.date?.toDate ? a.date.toDate().getTime() : 0
    const tB = b.date?.toDate ? b.date.toDate().getTime() : 0
    return tB - tA
  })
}

export async function deleteSession(sessionId) {
  return deleteDoc(doc(db, COLLECTION, sessionId))
}
