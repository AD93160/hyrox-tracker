import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './config'

export const AVATARS = [
  { id: 'a1',  emoji: '🏃', bg: '#3b82f6' },
  { id: 'a2',  emoji: '💪', bg: '#e63946' },
  { id: 'a3',  emoji: '🔥', bg: '#f59e0b' },
  { id: 'a4',  emoji: '⚡', bg: '#8b5cf6' },
  { id: 'a5',  emoji: '🏆', bg: '#10b981' },
  { id: 'a6',  emoji: '🎯', bg: '#ec4899' },
  { id: 'a7',  emoji: '🦁', bg: '#f97316' },
  { id: 'a8',  emoji: '❄️', bg: '#0ea5e9' },
  { id: 'a9',  emoji: '💎', bg: '#06b6d4' },
  { id: 'a10', emoji: '🌟', bg: '#eab308' },
  { id: 'a11', emoji: '🦅', bg: '#059669' },
  { id: 'a12', emoji: '🏔️', bg: '#64748b' },
]

export async function getProfile(userId) {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? snap.data() : null
}

export async function saveProfile(userId, data) {
  return setDoc(doc(db, 'users', userId), data, { merge: true })
}

export async function uploadAvatar(userId, file) {
  const avatarRef = ref(storage, `avatars/${userId}`)
  await uploadBytes(avatarRef, file)
  return getDownloadURL(avatarRef)
}
