import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './LoginPage.module.css'

function getAuthError(code) {
  const map = {
    'auth/email-already-in-use': 'Cette adresse e-mail est déjà utilisée.',
    'auth/weak-password':         'Mot de passe trop court (6 caractères minimum).',
    'auth/user-not-found':        'Aucun compte avec cet e-mail.',
    'auth/wrong-password':        'E-mail ou mot de passe incorrect.',
    'auth/invalid-email':         'Adresse e-mail invalide.',
    'auth/invalid-credential':    'E-mail ou mot de passe incorrect.',
    'auth/too-many-requests':     'Trop de tentatives. Réessayez plus tard.',
  }
  return map[code] || 'Une erreur est survenue. Veuillez réessayer.'
}

function EyeIcon({ visible }) {
  return visible ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export default function LoginPage() {
  const { login, signUpEmail, signInEmail, resetPassword } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  function switchMode(next) {
    setMode(next)
    setError('')
    setPassword('')
    setConfirm('')
    setShowPwd(false)
    setResetSent(false)
  }

  async function handleGoogle() {
    setError('')
    try {
      await login()
      navigate('/chrono')
    } catch {
      setError('Connexion Google échouée. Veuillez réessayer.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signInEmail(email, password)
        navigate('/chrono')
      } else if (mode === 'signup') {
        if (password !== confirm) {
          setError('Les mots de passe ne correspondent pas.')
          setLoading(false)
          return
        }
        await signUpEmail(email, password)
        navigate('/chrono')
      } else {
        await resetPassword(email)
        setResetSent(true)
      }
    } catch (err) {
      setError(getAuthError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Hyrox Tracker</h1>
        <p className={styles.subtitle}>
          {mode === 'login'  && 'Connectez-vous pour accéder à vos sessions'}
          {mode === 'signup' && 'Créez votre compte'}
          {mode === 'reset'  && 'Réinitialiser le mot de passe'}
        </p>

        {mode !== 'reset' && (
          <>
            <button className={styles.googleBtn} onClick={handleGoogle}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continuer avec Google
            </button>
            <div className={styles.divider}><span>ou</span></div>
          </>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Adresse e-mail</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              autoComplete="email"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div className={styles.field}>
              <label className={styles.label}>Mot de passe</label>
              <div className={styles.pwdWrapper}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={styles.inputPwd}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="6 caractères minimum"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                >
                  <EyeIcon visible={showPwd} />
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className={styles.field}>
              <label className={styles.label}>Confirmer le mot de passe</label>
              <div className={styles.pwdWrapper}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={styles.inputPwd}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Répétez le mot de passe"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}
          {resetSent && (
            <p className={styles.success}>
              Lien envoyé ! Vérifiez votre boîte e-mail.
            </p>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading || resetSent}>
            {loading ? '…' :
              mode === 'login'  ? 'Se connecter'    :
              mode === 'signup' ? 'Créer le compte' :
                                  'Envoyer le lien'}
          </button>
        </form>

        <div className={styles.links}>
          {mode === 'login' && (
            <>
              <button className={styles.linkBtn} onClick={() => switchMode('reset')}>
                Mot de passe oublié ?
              </button>
              <button className={styles.linkBtn} onClick={() => switchMode('signup')}>
                Créer un compte
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button className={styles.linkBtn} onClick={() => switchMode('login')}>
              Déjà un compte ? Se connecter
            </button>
          )}
          {mode === 'reset' && (
            <button className={styles.linkBtn} onClick={() => switchMode('login')}>
              ← Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
