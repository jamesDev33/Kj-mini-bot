# ≛⃝꥓𝑴𝑰𝑲𝑬𝒀 ᵖʳᶦᵐᵉ𓆩ㅤ ⁹⁹⁹

Bot WhatsApp multi-appareil (Baileys) — **Owner : Mikey prime**.

Aucune base de données externe (MongoDB, MySQL...) n'est nécessaire : toutes
les données (utilisateurs, groupes, avertissements, économie, niveaux/XP,
notes...) sont stockées localement dans des fichiers JSON, dans le dossier
`/database` à la racine du projet. Rien à configurer, rien à héberger en plus.

## ⚠️ Important : stockage persistant sur les hébergeurs gratuits

Les hébergeurs comme **Render, Railway, Katabump, Heroku (dynos gratuits)**
utilisent souvent un disque **éphémère** : tout ce qui est écrit sur le
disque est perdu à chaque redéploiement ou redémarrage du service.

- La **session WhatsApp** (`lib/auth_info_baileys/`) est régénérée
  automatiquement au démarrage à partir de la variable d'environnement
  `SESSION_ID` — donc elle survit sans problème à un redémarrage, tant que
  `SESSION_ID` reste configurée sur la plateforme.
- Les **données locales** (`/database/*.json` : warns, économie, XP,
  paramètres de groupe...) n'ont pas cette protection : elles seront
  réinitialisées à chaque redéploiement si le disque n'est pas persistant.

**Solution :** si ta plateforme propose un disque/volume persistant
(Railway "Volumes", Render "Persistent Disk", VPS, Katabump selon l'offre),
monte-le sur le dossier `/database` (et éventuellement
`/lib/auth_info_baileys`) pour conserver les données entre les redéploiements.
Sur un simple VPS ou en local, ce n'est pas un problème : le disque est déjà
persistant par défaut.

## Déploiement

### Render / Railway / Katabump (via Dockerfile)
Ces trois plateformes savent construire et lancer directement le
`Dockerfile` fourni à la racine du projet :
1. Pousse ce projet sur un dépôt Git (GitHub/GitLab).
2. Crée un nouveau service sur la plateforme et connecte le dépôt.
3. Choisis le mode de build **Docker** (Render : "Docker" ; Railway :
   détecté automatiquement s'il y a un Dockerfile ; Katabump : idem).
4. Renseigne les variables d'environnement (voir `config.env.example`) —
   au minimum `OWNER_NUMBER`, `OWNER_NAME` et `SESSION_ID`.
5. Le port est géré automatiquement via la variable `PORT` fournie par la
   plateforme (déjà pris en charge par le code, rien à changer).
6. (Recommandé) Ajoute un volume/disque persistant monté sur `/app/database`.

### Heroku
```bash
heroku create mon-bot
heroku stack:set container -a mon-bot
git push heroku main
```
Configure les variables via `heroku config:set OWNER_NUMBER=... OWNER_NAME=...`
ou en te servant du bouton "Deploy to Heroku" avec `app.json`.

### VPS / PC (sans Docker)
Voir [`deploy-on-vps.md`](./deploy-on-vps.md).

### Replit
`replit.nix` installe déjà `ffmpeg`, `imagemagick`, `libwebp`, `git`.
Renseigne les variables dans l'onglet "Secrets", puis `npm start`.

## ⚠️ Note de sécurité : fichiers protégés par l'auteur d'origine

Ce template contenait, dans certains fichiers (`commands/downloader.js`,
`commands/intro.js`, `commands/_xmenu3.0.js`, `commands/TicTacToe.js`), du
code **obfusqué** par l'auteur d'origine du template pour protéger sa
logique. J'ai retiré un piège "anti-debug" (code mort qui plante
volontairement le processus s'il détecte une modification/débogage) trouvé
dans `lib/client.js`, mais je n'ai **pas** touché aux 4 fichiers ci-dessus :
ils utilisent le même mécanisme d'auto-défense sur l'ensemble du fichier, et
les modifier risquerait de casser leur exécution. Aucun de ces 4 fichiers
n'utilise MongoDB ni de contenu pour adultes — ils fonctionnent normalement
tels quels. Si tu veux un jour une version 100% transparente (menu, intro,
téléchargeur, morpion) sans aucun code obfusqué, ces commandes peuvent être
réécrites proprement à la demande.

## Configuration

Copie `config.env.example` en `config.env` et adapte les valeurs
(`OWNER_NUMBER`, `OWNER_NAME`, `SESSION_ID`, `PREFIX`...). Voir ce fichier
pour la liste complète des variables disponibles.

## Développement local

```bash
npm install --legacy-peer-deps
cp config.env.example config.env   # puis édite config.env
npm start
```

Le port HTTP utilise `PORT` et vaut `5000` par défaut.
