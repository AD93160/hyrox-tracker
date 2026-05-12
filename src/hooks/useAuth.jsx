import { useState, useEffect, createContext, useContext } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    return onAuthStateChanged(auth, setUser)
  }, [])

  const login         = ()    => signInWithPopup(auth, googleProvider)
  const logout        = ()    => signOut(auth)
  const signUpEmail   = (e,p) => createUserWithEmailAndPassword(auth, e, p)
  const signInEmail   = (e,p) => signInWithEmailAndPassword(auth, e, p)
  const resetPassword = (e)   => sendPasswordResetEmail(auth, e)

  return (
    <AuthContext.Provider value={{ user, login, logout, signUpEmail, signInEmail, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
