## Déployer sur un VPS ou un PC

- Il te faut : git, ffmpeg, imagemagick, curl, nodejs, yarn, pm2.

   1. Installer git, ffmpeg, imagemagick, curl
      ```
      sudo apt -y update && sudo apt -y upgrade
      sudo apt -y install git ffmpeg imagemagick curl webp
      ```

   2. Installer nodejs (18+)
      ```
      sudo apt -y remove nodejs
      curl -fsSl https://deb.nodesource.com/setup_lts.x | sudo bash - && sudo apt -y install nodejs
      ```

   3. Installer yarn
      ```
      curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
      echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
      sudo apt -y update && sudo apt -y install yarn
      ```

   4. Installer pm2
      ```
      sudo yarn global add pm2
      ```

   5. Cloner le dépôt et installer les paquets
      ```
      git clone <URL-DE-TON-DEPOT>
      cd MIKEY-PRIME-LOCAL
      yarn install --network-concurrency 1
      ```

   6. Créer le fichier d'environnement
      ```
      cp config.env.example config.env
      nano config.env
      ```
      Renseigne au minimum `OWNER_NUMBER`, `OWNER_NAME` et `SESSION_ID`
      (voir `config.env.example` pour la liste complète des options).
      Aucune base de données externe n'est nécessaire : tout est stocké
      localement dans `/database`.

      ctrl + o puis ctrl + x pour sauvegarder et quitter.

   7. Démarrer / arrêter le bot

      Pour démarrer : `npm start`
      Pour tourner en arrière-plan avec redémarrage automatique (recommandé
      sur un VPS) :
      ```
      pm2 start lib/client.js --name mikey-prime
      pm2 save
      ```
      Pour arrêter : `pm2 stop mikey-prime` (ou `npm stop`)
