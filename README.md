# Hyrox Tracker

Suivez et analysez vos performances aux compétitions Hyrox.

## Fonctionnalités

- **Chronomètre par phase** : enregistrez votre temps sur chacune des 16 phases (8 runs + 8 stations)
- **Historique des sessions** : retrouvez toutes vos performances passées
- **Progression** : visualisez votre évolution dans le temps avec des graphiques

## Installation

```bash
git clone https://github.com/AD93160/hyrox-tracker.git
cd hyrox-tracker
npm install
cp .env.example .env   # puis remplir avec vos clés Firebase
npm run dev
```

## Firebase

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com)
2. Activez **Authentication** (provider Google)
3. Activez **Firestore Database**
4. Copiez vos clés dans `.env`

## Licence

MIT
