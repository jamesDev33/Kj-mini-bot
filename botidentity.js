/**
 * ===========================================================================
 *  BOT IDENTITY — personnalisation du compte WhatsApp du bot
 *  Ajouté pour Dark Evil sur MIKEY-PRIME-MD.
 * ===========================================================================
 *
 *  .setbotname <nom>          -> change le nom du compte WhatsApp du bot
 *  .setbotbio <texte>         -> change la description ("à propos") du bot
 *  .setbotpic                 -> change la photo de profil (répondre à une image)
 *  .setlink <lien>|<code>     -> remplace le lien de chaîne affiché dans .xmenu
 *  .resetlink <code>          -> remet le lien par défaut
 *
 *  Le "code" pour .setlink / .resetlink est une sécurité supplémentaire :
 *  il faut être owner (isCreator) ET connaître le code pour changer le lien.
 *  Par défaut le code est "DARKZONE-2026" — change-le en définissant la
 *  variable d'environnement LINK_CODE dans ton fichier .env / config Railway.
 */

const { cmd, Config, prefix, tlang } = require('../lib');

// ---------------------------------------------------------------------------
// Stockage persistant (partagé avec commands/xmenu.js)
// ---------------------------------------------------------------------------
if (!global.db.database) global.db.database = {};
if (!global.db.database.botIdentity) {
    global.db.database.botIdentity = {
        customLink: '',
        linkLocked: false,
        menuFont: 24
    };
}

const LINK_CODE = process.env.LINK_CODE || 'DARKZONE-2026';

// ---------------------------------------------------------------------------
// .setbotname
// ---------------------------------------------------------------------------
cmd({
    pattern: "setbotname",
    desc: "Change le nom affiché du compte WhatsApp du bot.",
    category: "owner",
    use: '<nouveau nom>',
    filename: __filename
}, async (Void, citel, text, { isCreator }) => {
    if (!isCreator) return citel.reply(tlang().owner);
    if (!text || !text.trim()) return citel.reply(`_Exemple :_ *${prefix}setbotname Dark Zone*`);

    try {
        await Void.updateProfileName(text.trim());
        return citel.reply(`✅ Nom du bot changé en : *${text.trim()}*`);
    } catch (e) {
        console.error('[setbotname]', e);
        return citel.reply('❌ Impossible de changer le nom (WhatsApp limite parfois cette action, réessaie plus tard).');
    }
});

// ---------------------------------------------------------------------------
// .setbotbio
// ---------------------------------------------------------------------------
cmd({
    pattern: "setbotbio",
    alias: ["setbotdesc", "setbotstatus"],
    desc: "Change la description (\"à propos\") du bot.",
    category: "owner",
    use: '<nouvelle description>',
    filename: __filename
}, async (Void, citel, text, { isCreator }) => {
    if (!isCreator) return citel.reply(tlang().owner);
    if (!text || !text.trim()) return citel.reply(`_Exemple :_ *${prefix}setbotbio ⚡ Bot opérationnel 24/7*`);

    try {
        await Void.updateProfileStatus(text.trim());
        return citel.reply('✅ Description du bot mise à jour.');
    } catch (e) {
        console.error('[setbotbio]', e);
        return citel.reply('❌ Impossible de changer la description.');
    }
});

// ---------------------------------------------------------------------------
// .setbotpic — répondre à une image
// ---------------------------------------------------------------------------
cmd({
    pattern: "setbotpic",
    alias: ["setbotpp"],
    desc: "Change la photo de profil du bot (répondre à une image).",
    category: "owner",
    use: '<en réponse à une image>',
    filename: __filename
}, async (Void, citel, text, { isCreator }) => {
    if (!isCreator) return citel.reply(tlang().owner);
    if (!citel.quoted || !/image/.test(citel.quoted.mtype)) {
        return citel.reply(`_Réponds à une image avec_ *${prefix}setbotpic*`);
    }

    try {
        const media = await citel.quoted.download(); // Buffer
        const botJid = Void.decodeJid ? await Void.decodeJid(Void.user.id) : Void.user.id;
        await Void.updateProfilePicture(botJid, media);
        return citel.reply('✅ Photo de profil du bot mise à jour.');
    } catch (e) {
        console.error('[setbotpic]', e);
        return citel.reply('❌ Impossible de changer la photo de profil.');
    }
});

// ---------------------------------------------------------------------------
// .setlink <lien>|<code>
// ---------------------------------------------------------------------------
cmd({
    pattern: "setlink",
    alias: ["setchannellink", "modelink"],
    desc: "Remplace le lien affiché dans .xmenu par ton propre lien (protégé par code).",
    category: "owner",
    use: '<lien>|<code>',
    filename: __filename
}, async (Void, citel, text, { isCreator }) => {
    if (!isCreator) return citel.reply(tlang().owner);
    if (!text || !text.includes('|')) {
        return citel.reply(
            `_Exemple :_\n*${prefix}setlink https://whatsapp.com/channel/xxxx|${LINK_CODE}*\n\n` +
            `_Le code sert de sécurité : sans lui, le lien ne peut pas être changé._`
        );
    }

    const [link, code] = text.split('|').map(v => v && v.trim());
    if (!link) return citel.reply('_Lien manquant._');
    if (code !== LINK_CODE) return citel.reply('❌ Code invalide. Le lien n\'a pas été changé.');

    global.db.database.botIdentity.customLink = link;
    global.db.database.botIdentity.linkLocked = true;
    return citel.reply(`✅ Lien personnalisé enregistré :\n${link}\n\n_Il apparaîtra désormais dans ${prefix}xmenu._`);
});

// ---------------------------------------------------------------------------
// .resetlink <code>
// ---------------------------------------------------------------------------
cmd({
    pattern: "resetlink",
    desc: "Retire le lien personnalisé et remet le lien du bot par défaut.",
    category: "owner",
    use: '<code>',
    filename: __filename
}, async (Void, citel, text, { isCreator }) => {
    if (!isCreator) return citel.reply(tlang().owner);
    if (!text || text.trim() !== LINK_CODE) return citel.reply('❌ Code invalide.');

    global.db.database.botIdentity.customLink = '';
    global.db.database.botIdentity.linkLocked = false;
    return citel.reply('✅ Lien remis par défaut.');
});
