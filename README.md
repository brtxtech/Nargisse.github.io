# Nargisse — Studio d’invitations de mariage (v2)

Site statique HTML / CSS / JavaScript, sans build. Bibliothèques (CDN) : canvas-confetti, qrcode-generator, Google Fonts.

## Structure
```
index.html          page d’entrée
css/studio.css      interface de l’éditeur (design system)
css/invite.css      la carte : enveloppes, décors, photo, sections, animations
js/catalog.js       toutes les listes d’options : 50 palettes, polices, motifs, musiques, textes FR/EN/AR
js/music.js         moteur audio (12 mélodies générées + extrait importé)
js/render.js        fabrique la carte, les décors, les particules, le RSVP, le QR
js/studio.js        éditeur, aperçu, partage, liens invités, export HTML, sélecteur d’extrait musical
assets/             envelope.jpg, venue.jpg, couple.jpg (à remplacer)
build.py            génère dist/nargisse.html (fichier unique)
```

## Déployer sur GitHub Pages
1. Envoyez tout le contenu de ce dossier à la racine d’un dépôt GitHub.
2. Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
3. Le site est en ligne sous `https://VOTRE-PSEUDO.github.io/NOM-DU-DEPOT/`.

## Ajouter des options
Tout est dans `js/catalog.js` (palettes `PAL`, polices `FH/FS/FB`, motifs `PATS`, musiques `MU`, `CAT`, `TPL`). Ajoutez une ligne : l’éditeur l’affiche automatiquement.

## Liens invités
« Partager » → saisissez un invité par ligne : chaque lien affiche « Cher(e) NOM » sur la carte.
Le lien ne contient pas la musique ni les photos importées ; le **fichier HTML** téléchargé est complet.

## Administration (v2.1)

Une vue admin protégée par mot de passe pour ajouter des fonctionnalités au site. **Chaque catégorie est enregistrée dans son propre fichier** : `data/features/<categorie>.js` (+ `.json`). Les fichiers envoyés (images, musiques, polices) vont dans `uploads/<categorie>/`.

### Lancer
```
npm start            # ou : node admin/server.js   (Node 18+, aucune dépendance)
```
- Site : http://localhost:3000/ — Admin : http://localhost:3000/admin/
- Au premier lancement, l’identifiant `admin` et un **mot de passe provisoire** s’affichent dans le terminal (à changer dans l’admin → « Mot de passe »).
- Mot de passe oublié : `npm run reset-password`.
- Les identifiants sont dans `admin/private/` (déjà exclu par `.gitignore` : ne le publiez jamais).

### Catégories
Pétales & particules · Musiques · Décors latéraux · Fonds · Enveloppes (photo) · Polices · Palettes · Lieux.
Chaque ajout apparaît automatiquement dans l’éditeur (même liste de choix que les options existantes).

### Pétales : premier plan ou arrière-plan
Dans l’éditeur → « Pétales & particules » → **Plan des pétales** : *Premier plan* (devant la carte, par défaut) ou *Arrière-plan* (derrière le texte et les cartes).

### Publier sur GitHub Pages
GitHub Pages est statique : l’admin (connexion + envoi de fichiers) fonctionne en local. Après vos ajouts, envoyez les dossiers `data/` et `uploads/` sur GitHub : le site public les lit tout seul.

### Ajouter une nouvelle catégorie
1. Déclarez-la dans `SCHEMA` (`admin/server.js`) : l’admin se construit seul.
2. Branchez-la dans le bloc « Fonctionnalités ajoutées depuis l’admin » de `js/catalog.js`.
3. Ajoutez son nom à `FEATS` (`js/studio.js`, `build.py`) et une balise `<script>` dans `index.html`.

### Sécurité (résumé)
Mot de passe haché (scrypt) · cookie de session signé, HttpOnly, SameSite=Strict, 8 h · blocage après 5 échecs (15 min) · en-tête anti-CSRF · formats et signatures de fichiers vérifiés, SVG avec script refusé · serveur sur 127.0.0.1 par défaut (`HOST=0.0.0.0` pour l’exposer ; mettez alors HTTPS devant).
