# Plan HeartGuard

## Application à construire
- Transformer l’écran vide en une application mobile-first HeartGuard, avec une palette vert clair cohérente sur tous les écrans.
- Créer un parcours fluide : accueil avec cœur vert, présentation de la consultation, inscription/connexion, informations personnelles, résultats, rendez-vous, informations médicales et contact.
- Réutiliser les images fournies comme références visuelles et intégrer l’illustration médicale fournie pour la consultation.

## Écrans et interactions
- Accueil : cœur vert immersif, identité HeartGuard et bouton de démarrage.
- Consultation générale : présentation et accès à l’authentification.
- Inscription et connexion : formulaires animés, validation visuelle, bascule entre les deux modes.
- Profil médical : nom, âge, sexe et problèmes cardiaques, avec enregistrement local pour la démonstration.
- Résultats : résumé de santé, histogramme, évolution du rythme cardiaque et indicateurs lisibles.
- Rendez-vous : sélection de date et d’heure, confirmation et possibilité d’annuler/reprogrammer.
- Informations médicales : conseils alimentation et activité physique.
- Contact : prochain rendez-vous et formulaire de message.

## Direction visuelle
- Interface claire et rassurante, vert menthe et vert médical profond, cartes blanches, coins modérés et typographie nette.
- Navigation inférieure adaptée au téléphone et navigation latérale compacte sur grand écran.
- Animations discrètes sur les formulaires, transitions d’écran et graphiques, avec respect du réglage de réduction des animations.

## Détails techniques
- React avec TanStack Start et TypeScript, sans serveur Python nécessaire pour cette version interactive.
- Composants réutilisables, graphiques Recharts et icônes Lucide.
- Données de démonstration conservées dans le navigateur, sans création de compte réel ni stockage distant.
- Métadonnées HeartGuard et icône de marque incluses.
- Vérification finale sur téléphone et ordinateur.
