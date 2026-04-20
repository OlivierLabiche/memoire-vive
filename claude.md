# Mémoire vive — Cahier des charges V1

## Vision

Application mobile-first de capture rapide (tâches, idées, courses) avec classification automatique par IA vocale. Stack : React + Vite + Netlify + Airtable + Claude API.

**Tagline :** *le pense-pas-bête*

---

## Architecture

```
iPhone (PWA)
    ↓
React SPA (Netlify)
    ↓
Netlify Functions (serverless)
    ├── /api/classify  →  Claude API (classification vocale)
    ├── /api/airtable   →  Airtable API (lecture/écriture)
    └── /api/courses    →  Airtable API (liste de courses)
```

### Clés API (variables d'environnement Netlify)

- `ANTHROPIC_API_KEY` — clé Claude API
- `AIRTABLE_API_KEY` — personal access token Airtable
- `AIRTABLE_BASE_ID` — `app4hH2mDMLyxC94E`

---

## Base Airtable existante

**Base :** Mémoire vive (`app4hH2mDMLyxC94E`)

### Table Inbox (`tbleeLx0onVxFdPIa`)

| Champ | Type | Description |
|-------|------|-------------|
| Résumé | singleLineText (primary) | Reformulation courte |
| Message brut | multilineText | Texte original dicté |
| Projet | singleSelect | 11 projets (voir liste) |
| Urgence | singleSelect | 🔴 Urgent, 🟡 Cette semaine, 🟢 Quand je peux |
| Durée estimée | singleSelect | 5 min max, 20 min, ~1 heure, 2 heures, Demi-journée, Long terme |
| Deadline | date | |
| Fait | checkbox | |
| Statut | singleSelect | À faire, En cours, Fait, Archivé |
| Lieu | singleLineText | |
| Confiance IA | singleSelect | 🟢 Sûr, 🟠 Incertain, 🔵 Validé |
| Date de capture | createdTime | |

**Note :** Le champ "Type" a été supprimé (plus besoin).

### Table Carnet (`tbl6RN1bEC5lD1U9q`)

| Champ | Type | Description |
|-------|------|-------------|
| Résumé | singleLineText (primary) | Reformulation courte |
| Message brut | multilineText | Texte original |
| Projet | singleSelect | 11 projets |
| Référence | checkbox | À ajouter (remplace le champ Type) |
| Tags | singleLineText | Mots-clés libres |
| Confiance IA | singleSelect | 🟢 Sûr, 🟠 Incertain, 🔵 Validé |
| Date de capture | createdTime | |

### Table Courses (à créer)

| Champ | Type |
|-------|------|
| Item | singleLineText (primary) |
| Fait | checkbox |
| Date de capture | createdTime |

### 11 Projets

Santé et forme, Formation, Chaotik Lab, Lacan, Dramathérapie / Théâtre Sensible, La Voix des Papillons, Radio Tik Tak, Présence numérique, Trading, Perso / Famille, Spectacle / Création.

---

## Interface React

Le prototype V4 (`memoire-vive-v4.jsx`) sert de base. Structure validée :

### Navigation principale

Toggle haut niveau **Faire / Penser** — deux mondes parallèles, même style unifié (palette chaude, fond `#F6F4F0`, accents brun pour Faire, bleu-gris pour Penser).

### Mode Faire

- Sous-navigation : Aujourd'hui / Semaine / Mois
- Filtre projet (dropdown discret en haut à droite)
- Section "Aujourd'hui" : tâches du jour, cochables, triées par urgence
- Section "À trier" : tâches sans projet assigné (badge compteur)
- Section "Courses" : checklist permanente avec ajout rapide (visible uniquement sur Aujourd'hui)
- Semaine/Mois : tâches triées par deadline la plus proche, non faites en premier

### Mode Penser

- Filtre projet (même dropdown)
- Section "Dernières réflexions" : idées récentes, dépliables
- Section "À trier" : idées sans projet assigné

### Notes compactes (NoteRow)

- Ligne unique : titre tronqué + pastille urgence + durée + date
- Clic → déplie le contenu complet + tags projet/urgence/durée
- Tâches : checkbox cochable
- Idées : petit point (bleu si référence, gris sinon)

### Capture

- **Bouton "+ Capturer"** (FAB fixe en bas)
- Clic → menu contextuel : Tâche / Idée / Courses
- Modal de saisie avec tags optionnels (projet, urgence, durée, référence)
- Mode Courses : saisie libre, séparation par virgule ou retour à la ligne

### Capture vocale (🎙)

- **Bouton micro** rouge à côté de "+ Capturer"
- Appui → overlay plein écran, transcription en temps réel (Web Speech API, fr-FR)
- Appui pour arrêter → classification automatique via Claude
- Résultat : modal pré-rempli (tâche/idée) ou ajout direct (courses)

### Recherche

- Bouton loupe en haut → champ de recherche, filtrage en temps réel

---

## Netlify Function : /api/classify

### Input
```json
{ "text": "faut que j'appelle le comptable pour le statut auto-entrepreneur, c'est urgent" }
```

### Prompt système Claude

```
Tu es un assistant de tri pour l'app Mémoire vive. L'utilisateur dicte une note vocale. Classe-la.

Projets disponibles : [liste des 11 projets]
Urgences : urgent, semaine, quand je peux
Durées : 5 min max, 20 min, ~1 heure, 2 heures, Demi-journée, Long terme

Réponds UNIQUEMENT en JSON :
{
  "mode": "tache" | "carnet" | "course",
  "text": "texte nettoyé et reformulé",
  "projet": "nom du projet ou vide",
  "urgence": "urgent | semaine | quand je peux ou vide",
  "duree": "durée estimée ou vide",
  "reference": false,
  "courses": ["item1","item2"] (seulement si mode=course),
  "confidence": "high" | "medium" | "low"
}
```

### Output → pré-remplissage du modal ou ajout direct

---

## Netlify Function : /api/airtable

Proxy CRUD vers Airtable :

- `GET /api/airtable?table=inbox&view=today` → lire les tâches
- `POST /api/airtable?table=inbox` → créer un record
- `PATCH /api/airtable?table=inbox&id=xxx` → modifier (cocher fait, etc.)
- `GET /api/airtable?table=carnet` → lire les idées
- `POST /api/airtable?table=carnet` → créer une idée
- `GET /api/airtable?table=courses` → lire les courses
- `POST /api/airtable?table=courses` → ajouter un item
- `PATCH /api/airtable?table=courses&id=xxx` → cocher/décocher

---

## PWA (installation iPhone)

- `manifest.json` : nom, icône, couleur, display standalone
- `service-worker.js` : cache basique pour fonctionnement offline léger
- Raccourcis iOS via Shortcuts : "Nouvelle tâche" / "Nouvelle idée" qui ouvrent l'app avec un paramètre URL

---

## Structure du projet

```
memoire-vive/
├── index.html
├── vite.config.js
├── package.json
├── netlify.toml
├── public/
│   ├── manifest.json
│   └── icon-192.png
├── src/
│   ├── main.jsx
│   ├── App.jsx              ← proto V4 adapté
│   ├── components/
│   │   ├── NoteRow.jsx
│   │   ├── Section.jsx
│   │   ├── CaptureModal.jsx
│   │   ├── CourseList.jsx
│   │   └── VoiceCapture.jsx
│   ├── hooks/
│   │   ├── useAirtable.js   ← fetch/cache/mutation
│   │   └── useSpeech.js     ← Web Speech API
│   ├── lib/
│   │   ├── api.js           ← appels Netlify Functions
│   │   └── constants.js     ← projets, urgences, couleurs
│   └── styles/
│       └── index.css
└── netlify/
    └── functions/
        ├── classify.js
        └── airtable.js
```

---

## Ordre de build recommandé

1. **Scaffold** : Vite + React + Netlify config + déploiement vide
2. **Netlify Function Airtable** : proxy CRUD, tester avec curl
3. **Lecture** : afficher les vraies données Airtable dans l'UI
4. **Écriture** : créer/modifier des records depuis l'UI
5. **Courses** : créer la table Airtable + brancher la liste
6. **Classification vocale** : Netlify Function classify + bouton micro + Web Speech
7. **PWA** : manifest + service worker + installation iPhone
8. **Polish** : transitions, offline graceful, edge cases

---

## Conventions

- Pas de PR, push direct sur main (workflow habituel)
- Communication en français
- Pas d'usine à gaz : chaque fichier fait une chose
- Mobile-first, desktop = bonus futur
- Airtable = admin/planification, app = capture/consultation
