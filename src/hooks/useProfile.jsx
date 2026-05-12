import { useState, useEffect, createContext, useContext } from 'react'
import { useAuth } from './useAuth'
import { getProfile, saveProfile, AVATARS } from '../firebase/profile'

const ProfileContext = createContext(null)

const DEFAULT_PROFILE = { pseudo: '', avatarId: AVATARS[0].id, avatarUrl: '' }

export function ProfileProvider({ children }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!user) { setProfile(null); return }
    getProfile(user.uid).then(data => {
      setProfile(data || { ...DEFAULT_PROFILE })
    })
  }, [user?.uid])

  async function updateProfile(updates) {
    if (!user) return
    const next = { ...(profile || DEFAULT_PROFILE), ...updates }
    setProfile(next)
    await saveProfile(user.uid, next)
  }

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext) ?? { profile: null, updateProfile: async () => {} }
}
