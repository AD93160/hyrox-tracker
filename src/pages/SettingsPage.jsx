import { useSettings } from '../hooks/useSettings'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const { settings, updateSetting } = useSettings()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Réglages</h1>

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
