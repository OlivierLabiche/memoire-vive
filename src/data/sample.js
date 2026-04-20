import { d } from "../lib/utils.js";

export const SAMPLE = [
  { id: 1, mode: "tache", text: "Appeler le comptable pour le statut auto-entrepreneur", projet: "Chaotik Lab", urgence: "urgent", duree: "20 min", time: d(0, 8), done: false },
  { id: 2, mode: "tache", text: "Préparer le canevas pour la répétition avec Pierre", projet: "Spectacle / Création", urgence: "semaine", duree: "~1 heure", time: d(0, 9), done: false },
  { id: 3, mode: "tache", text: "Répondre au mail de la MJC pour les ateliers de juin", projet: "Dramathérapie / Théâtre Sensible", urgence: "urgent", duree: "20 min", time: d(0, 10), done: true },
  { id: 4, mode: "tache", text: "Mettre à jour le profil Google My Business", projet: "Chaotik Lab", urgence: "semaine", duree: "20 min", time: d(1, 9), done: false },
  { id: 5, mode: "tache", text: "Fixer le bug d'affichage mobile sur TradeSpotter", projet: "Trading", urgence: "quand je peux", duree: "~1 heure", time: d(2, 14), done: false },
  { id: 6, mode: "tache", text: "Prendre RDV chez le dentiste", projet: "Santé et forme", urgence: "semaine", duree: "5 min max", time: d(3, 10), done: false },
  { id: 7, mode: "tache", text: "Envoyer les photos de l'appartement à Maria", projet: "Perso / Famille", urgence: "quand je peux", duree: "20 min", time: d(5, 11), done: false },
  { id: 8, mode: "tache", text: "Acheter une coque pour le nouveau MacBook", projet: "", urgence: "semaine", duree: "20 min", time: d(0, 11), done: false },
  { id: 9, mode: "tache", text: "Vérifier les disponibilités Airbnb Granada juillet", projet: "", urgence: "", duree: "~1 heure", time: d(0, 14), done: false },
  { id: 10, mode: "carnet", text: "Explorer le lien entre le holding environment de Winnicott et l'espace de jeu dans l'impro sensible — la scène comme espace transitionnel, un lieu où l'on peut échouer sans conséquence réelle.", projet: "Dramathérapie / Théâtre Sensible", reference: false, time: d(0, 7) },
  { id: 11, mode: "carnet", text: "Podcast France Culture sur Lacan et le stade du miroir — épisode du 12 avril 2026", projet: "Lacan", reference: true, time: d(-1, 20) },
  { id: 12, mode: "carnet", text: "Idée pour Monter en bas : Paul pourrait commenter un silence de Pierre comme s'il s'agissait d'un moment de grâce radiophonique — le silence devient l'événement.", projet: "Spectacle / Création", reference: false, time: d(-1, 15) },
  { id: 13, mode: "carnet", text: "Article Revue Française de Psychanalyse sur le Nachträglichkeit et sa pertinence en art-thérapie — à relire et annoter.", projet: "Lacan", reference: true, time: d(-2, 11) },
  { id: 14, mode: "carnet", text: "Et si le fibo de biais obligatoire fonctionnait comme le neutre-marche en impro sensible : un reset corporel avant l'action. Un geste physique qui freine l'impulsion.", projet: "Trading", reference: false, time: d(-3, 10) },
  { id: 15, mode: "carnet", text: "Chercher des exemples de portfolios artisan numérique pour le site Chaotik Lab", projet: "", reference: false, time: d(0, 12) },
  { id: 16, mode: "carnet", text: "Revoir la structure du pitch pour les ateliers en EHPAD", projet: "", reference: false, time: d(-1, 9) },
];

export const SAMPLE_COURSES = [
  { id: 100, text: "Lait", done: false },
  { id: 101, text: "Pain", done: false },
  { id: 102, text: "Citrons", done: false },
  { id: 103, text: "Café en grains", done: true },
  { id: 104, text: "Papier toilette", done: false },
];
