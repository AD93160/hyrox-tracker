# Hyrox Tracker

Application de suivi de performances Hyrox construite avec React + Vite + Firebase.

## Stack

- **React 18** + **Vite 5** — UI et build
- **Firebase 10** — Auth (Google) + Firestore (données sessions)
- **React Router 6** — Navigation
- **Recharts** — Graphiques de progression

## Structure

```
src/
├── firebase/
│   ├── config.js       # Initialisation Firebase
│   └── sessions.js     # CRUD sessions Firestore
├── hooks/
│   └── useAuth.jsx     # Hook d'authentification Firebase
├── utils/
│   └── phases.js       # Définition des 8 phases Hyrox (Run + station)
├── components/
│   └── Layout.jsx      # Navigation + wrapper commun
├── pages/
│   ├── LoginPage.jsx   # Connexion Google
│   ├── ChronoPage.jsx  # Chronomètre par phase
│   ├── SessionsPage.jsx# Historique des sessions
│   └── ProgressPage.jsx# Graphiques de progression
├── styles/
│   └── index.css       # Reset + variables CSS globales
├── App.jsx             # Routes + ProtectedRoute
└── main.jsx            # Entrée React
```

## Configuration

Copier `.env.example` en `.env` et renseigner les clés Firebase.

## Commandes

```bash
npm install       # Installer les dépendances
npm run dev       # Serveur de développement (localhost:5173)
npm run build     # Build de production
npm run preview   # Prévisualiser le build
```

## Modèle de données Firestore

### Collection `sessions`

```js
{
  userId: string,
  date: Timestamp,
  totalTime: number,       // secondes
  phases: [
    {
      id: string,          // ex: "run1", "skierg", ...
      label: string,
      time: number,        // secondes
    }
  ],
  notes: string
}
```

## Phases Hyrox (ordre officiel)

1. Run 1 km
2. SkiErg 1000 m
3. Run 1 km
4. Sled Push 50 m
5. Run 1 km
6. Sled Pull 50 m
7. Run 1 km
8. Burpee Broad Jump 80 m
9. Run 1 km
10. Rowing 1000 m
11. Run 1 km
12. Farmers Carry 200 m
13. Run 1 km
14. Sandbag Lunges 100 m
15. Run 1 km
16. Wall Balls 100 reps
