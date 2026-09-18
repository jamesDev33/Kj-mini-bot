/**
 * ===========================================================================
 *  STICKER PACK — sticker nommé + créateur de pack en lot
 *  Ajouté pour Dark Evil sur MIKEY-PRIME-MD.
 * ===========================================================================
 *
 *  .stickname <pack>|<auteur>   -> sticker (réponse à image/vidéo) avec un
 *                                  nom de pack et un auteur personnalisés
 *
 *  .packstart                   -> démarre une session de capture
 *  (envoyer ensuite des photos, une par une, sans commande)
 *  .packstatus                  -> voir combien de photos sont en attente
 *  .pack <pack>|<auteur>        -> transforme toutes les photos capturées
 *                                  en stickers du pack demandé
 *  .packcancel                  -> annule la session en cours
 *
 *  Les sessions sont gardées en mémoire (pas besoin de survivre à un
 *  redémarrage du bot) et expirent après 10 minutes d'inactivité.
 */

const { cmd, Config, prefix, sleep } = require('../lib');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

const packSessions = new Map();
const SESSION_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_IMAGES = 30;

function sessionKey(citel) {
    return `${citel.chat}_${citel.sender}`;
}

function cleanExpired() {
    const now = Date.now();
    for (const [key, session] of packSessions.entries()) {
        if (now - session.started > SESSION_TTL) packSessions.delete(key);
    }
}

function parsePackAuthor(text) {
    let pack = Config.packname;
    let author = Config.author;
    if (text && text.trim()) {
        const [p, a] = text.split('|').map(v => v && v.trim());
        if (p) pack = p;
        if (a) author = a;
    }
    return { pack, author };
}

// ---------------------------------------------------------------------------
// .stickname — sticker unique avec pack/auteur personnalisés
// ---------------------------------------------------------------------------
cmd({
    pattern: "stickname",
    alias: ["stickername", "snom"],
    desc: "Crée un sticker avec un nom de pack et un auteur personnalisés.",
    category: "sticker",
    use: '<pack>|<auteur> (en réponse à une image/vidéo)',
    filename: __filename
}, async (Void, citel, text) => {
    if (!citel.quoted) {
        return citel.reply(`_Réponds à une image ou une vidéo avec :_\n*${prefix}stickname MonPack|MonNom*`);
    }
    const mime = citel.quoted.mtype;
    if (!/image|video|sticker/.test(mime)) {
        return citel.reply('_Réponds à une image, une vidéo ou un sticker._');
    }

    const { pack, author } = parsePackAuthor(text);
    const media = await citel.quoted.download();
    citel.reply('_Création du sticker..._');

    try {
        const sticker = new Sticker(media, {
            pack,
            author,
            type: StickerTypes.FULL,
            quality: 70,
            background: 'transparent'
        });
        const buffer = await sticker.toBuffer();
        return Void.sendMessage(citel.chat, { sticker: buffer }, { quoted: citel });
    } catch (e) {
        console.error('[stickname]', e);
        return citel.reply('❌ Erreur lors de la création du sticker.');
    }
});

// ---------------------------------------------------------------------------
// .packstart — démarre la capture d'un lot de photos
// ---------------------------------------------------------------------------
cmd({
    pattern: "packstart",
    alias: ["startpack"],
    desc: "Démarre la capture d'un lot de photos pour créer un pack de stickers.",
    category: "sticker",
    filename: __filename
}, async (Void, citel) => {
    cleanExpired();
    packSessions.set(sessionKey(citel), { images: [], started: Date.now() });
    return citel.reply(
        `📦 *Mode Pack Sticker activé.*\n\n` +
        `Envoie maintenant tes photos, une par une (sans légende).\n` +
        `Chaque photo reçue sera confirmée par une réaction ✅.\n\n` +
        `Quand tu as fini :\n` +
        `› *${prefix}pack MonPack|MonNom* — génère tous les stickers\n` +
        `› *${prefix}packstatus* — voir combien de photos sont en attente\n` +
        `› *${prefix}packcancel* — annuler\n\n` +
        `_Session valide 10 minutes, ${MAX_IMAGES} photos max._`
    );
});

// ---------------------------------------------------------------------------
// Capture passive : dès qu'une image arrive et qu'une session est active
// ---------------------------------------------------------------------------
cmd({
    on: "image",
    dontAddCommandList: true,
    filename: __filename
}, async (Void, citel) => {
    cleanExpired();
    const key = sessionKey(citel);
    const session = packSessions.get(key);
    if (!session) return; // pas de session active pour cet utilisateur, on ignore

    if (session.images.length >= MAX_IMAGES) {
        return citel.reply(`⚠️ Limite de ${MAX_IMAGES} photos atteinte. Tape *${prefix}pack* pour générer le pack maintenant.`);
    }

    try {
        const media = await citel.download();
        session.images.push(media);
        await citel.react('✅');
    } catch (e) {
        console.error('[packsticker] erreur capture image', e);
    }
});

// ---------------------------------------------------------------------------
// .packstatus
// ---------------------------------------------------------------------------
cmd({
    pattern: "packstatus",
    desc: "Affiche combien de photos sont en attente dans le pack en cours.",
    category: "sticker",
    filename: __filename
}, async (Void, citel) => {
    cleanExpired();
    const session = packSessions.get(sessionKey(citel));
    if (!session) return citel.reply(`_Aucune session en cours. Tape *${prefix}packstart* pour commencer._`);
    return citel.reply(`📦 *${session.images.length}* photo(s) en attente dans ton pack.`);
});

// ---------------------------------------------------------------------------
// .packcancel
// ---------------------------------------------------------------------------
cmd({
    pattern: "packcancel",
    alias: ["cancelpack"],
    desc: "Annule la session de capture de pack en cours.",
    category: "sticker",
    filename: __filename
}, async (Void, citel) => {
    const key = sessionKey(citel);
    if (!packSessions.has(key)) return citel.reply('_Aucune session en cours._');
    packSessions.delete(key);
    return citel.reply('🗑️ Session annulée.');
});

// ---------------------------------------------------------------------------
// .pack <pack>|<auteur> — génère tous les stickers du lot capturé
// ---------------------------------------------------------------------------
cmd({
    pattern: "pack",
    alias: ["makepack", "packmake"],
    desc: "Transforme toutes les photos capturées en stickers d'un même pack.",
    category: "sticker",
    use: '<pack>|<auteur>',
    filename: __filename
}, async (Void, citel, text) => {
    const key = sessionKey(citel);
    const session = packSessions.get(key);
    if (!session || session.images.length === 0) {
        return citel.reply(`_Aucune photo en attente. Envoie d'abord *${prefix}packstart* puis tes photos._`);
    }

    const { pack, author } = parsePackAuthor(text);
    citel.reply(`⏳ Génération de *${session.images.length}* sticker(s) pour le pack *${pack}*...`);

    let sent = 0;
    for (const media of session.images) {
        try {
            const sticker = new Sticker(media, {
                pack,
                author,
                type: StickerTypes.FULL,
                quality: 70,
                background: 'transparent'
            });
            const buffer = await sticker.toBuffer();
            await Void.sendMessage(citel.chat, { sticker: buffer });
            sent++;
            await sleep(700); // petite pause pour éviter le flood
        } catch (e) {
            console.error('[pack] erreur génération sticker', e);
        }
    }

    packSessions.delete(key);
    return citel.reply(`✅ Pack terminé : *${sent}/${session.images.length}* sticker(s) envoyé(s).`);
});
