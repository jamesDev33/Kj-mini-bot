FROM node:20-bookworm-slim

# git       : requis par certaines commandes (simple-git)
# ffmpeg    : conversion audio/vidéo/stickers (commands/audio.js, converter.js, lib/scraper.js)
# imagemagick : commande "convert" utilisée par lib/conv.js
# webp      : outils cwebp/img2webp pour les stickers
RUN apt-get update && apt-get install -y --no-install-recommends \
    git ffmpeg imagemagick webp \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# --legacy-peer-deps : ce projet mélange des dépendances anciennes dont les
# "peerDependencies" ne sont pas toutes cohérentes entre elles (ex: baileys vs
# sharp). Sans ce flag, npm (7+) refuse d'installer au moindre conflit de peer
# dependency avec une erreur ERESOLVE, même quand le conflit est sans impact réel.
RUN npm install --omit=dev --legacy-peer-deps

COPY . .

# Dossier de stockage local (base de données JSON + session WhatsApp).
# Sur Render/Railway/Katabump, monte un volume/disque persistant sur /app/database
# et /app/lib/auth_info_baileys pour ne pas perdre les données à chaque redéploiement.
RUN mkdir -p /app/database /app/lib/auth_info_baileys

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "lib/client.js"]
