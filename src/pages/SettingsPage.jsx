import { useState, useEffect, useRef } from 'react'
import { useSettings } from '../hooks/useSettings'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../hooks/useAuth'
import { AVATARS, uploadAvatar } from '../firebase/profile'
import styles from './SettingsPage.module.css'

function AvatarPreview({ profile, size = 56 }) {
  if (profile?.avatarUrl) {
    return (
      <img
        src={profile.avatarUrl}
        alt="avatar"
        className={styles.avatarPreviewImg}
        style={{ width: size, height: size }}
      />
    )
  }
  const av = AVATARS.find(a => a.id === profile?.avatarId) ?? AVATARS[0]
  return (
    <span
      className={styles.avatarPreviewEmoji}
      style={{ background: av.bg, width: size, height: size, fontSize: size * 0.5 }}
    >
      {av.emoji}
    </span>
  )
}

export default function SettingsPage() {
  const { settings, updateSetting } = useSettings()
  const { profile, updateProfile } = useProfile()
  const { user } = useAuth()
  const fileRef = useRef(null)

  const [pseudo, setPseudo] = useState('')
  const [pseudoSaved, setPseudoSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (profile) setPseudo(profile.pseudo || '')
  }, [profile])

  async function handleSavePseudo() {
    await updateProfile({ pseudo: pseudo.trim() })
    setPseudoSaved(true)
    setTimeout(() => setPseudoSaved(false), 2000)
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setUploadError('Veuillez sélectionner une image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image trop lourde (5 Mo maximum).')
      return
    }
    setUploading(true)
    setUploadError('')
    try {
      const url = await uploadAvatar(user.uid, file)
      await updateProfile({ avatarUrl: url })
    } catch {
      setUploadError('Erreur lors du téléversement. Réessayez.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleRemovePhoto() {
    await updateProfile({ avatarUrl: '' })
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Réglages</h1>

      {/* ── Profil ── */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Profil</p>

        <div className={styles.pseudoRow}>
          <input
            type="text"
            className={styles.pseudoInput}
            value={pseudo}
            onChange={e => { setPseudo(e.target.value); setPseudoSaved(false) }}
            placeholder="Votre pseudo"
            maxLength={30}
          />
          <button
            className={`${styles.saveBtn} ${pseudoSaved ? styles.saveBtnDone : ''}`}
            onClick={handleSavePseudo}
            disabled={pseudo.trim() === (profile?.pseudo ?? '') && !pseudoSaved}
          >
            {pseudoSaved ? '✓ Sauvegardé' : 'Sauvegarder'}
          </button>
        </div>

        {/* Avatar */}
        <p className={styles.avatarLabel}>Avatar</p>

        <div className={styles.avatarUploadRow}>
          <AvatarPreview profile={profile} size={56} />
          <div className={styles.avatarUploadActions}>
            <input
              type="file"
              accept="image/*"
              className={styles.fileInput}
              ref={fileRef}
              onChange={handleFileChange}
            />
            <button
              className={styles.uploadBtn}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Téléversement…' : 'Choisir une photo'}
            </button>
            {profile?.avatarUrl && (
              <button className={styles.removePhotoBtn} onClick={handleRemovePhoto}>
                Supprimer la photo
              </button>
            )}
          </div>
        </div>
        {uploadError && <p className={styles.uploadError}>{uploadError}</p>}

        <p className={styles.avatarSubLabel}>ou choisir un avatar</p>
        <div className={styles.avatarGrid}>
          {AVATARS.map(av => (
            <button
              key={av.id}
              className={`${styles.avatarOption} ${!profile?.avatarUrl && profile?.avatarId === av.id ? styles.avatarActive : ''}`}
              onClick={() => updateProfile({ avatarId: av.id, avatarUrl: '' })}
              aria-label={av.emoji}
            >
              <span className={styles.avatarEmoji} style={{ background: av.bg }}>
                {av.emoji}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Unité de vitesse ── */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Unité de vitesse</p>
        <p className={styles.sectionDesc}>
          Utilisée pour saisir et afficher la vitesse sur les phases de course.
        </p>
        <div className={styles.options}>
          <button
            className={`${styles.option} ${settings.speedUnit === 'kmh' ? styles.optionActive : ''}`}
            onClick={() => updateSetting('speedUnit', 'kmh')}
          >
            <span className={styles.optionLabel}>km/h</span>
            <span className={styles.optionExample}>ex : 10.5 km/h</span>
          </button>
          <button
            className={`${styles.option} ${settings.speedUnit === 'minpkm' ? styles.optionActive : ''}`}
            onClick={() => updateSetting('speedUnit', 'minpkm')}
          >
            <span className={styles.optionLabel}>min/km</span>
            <span className={styles.optionExample}>ex : 5:42 /km</span>
          </button>
        </div>
      </div>
    </div>
  )
}
