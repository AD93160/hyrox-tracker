import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
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
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function deleteSession(sessionId) {
  return deleteDoc(doc(db, COLLECTION, sessionId))
}
