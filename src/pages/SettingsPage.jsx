import { useState, useEffect } from 'react'
import { useSettings } from '../hooks/useSettings'
import { useProfile } from '../hooks/useProfile'
import { AVATARS } from '../firebase/profile'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const { settings, updateSetting } = useSettings()
  const { profile, updateProfile } = useProfile()

  const [pseudo, setPseudo] = useState('')
  const [pseudoSaved, setPseudoSaved] = useState(false)

  useEffect(() => {
    if (profile) setPseudo(profile.pseudo || '')
  }, [profile])

  async function handleSavePseudo() {
    await updateProfile({ pseudo: pseudo.trim() })
    setPseudoSaved(true)
    setTimeout(() => setPseudoSaved(false), 2000)
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

        <p className={styles.avatarLabel}>Avatar</p>
        <div className={styles.avatarGrid}>
          {AVATARS.map(av => (
            <button
              key={av.id}
              className={`${styles.avatarOption} ${profile?.avatarId === av.id ? styles.avatarActive : ''}`}
              onClick={() => updateProfile({ avatarId: av.id })}
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
