/**
 * ===========================================================================
 *  I18N — système de langue simple pour MIKEY-PRIME-MD
 *  Ajouté pour Dark Evil.
 * ===========================================================================
 *
 *  Le bot utilise normalement un système de "thèmes" (Config.LANG + fichiers
 *  dans ./Themes/*.json) mais ces fichiers ne sont pas présents dans ce
 *  projet, ce qui fait planter tlang() dès qu'il est appelé. Ce module est
 *  donc totalement indépendant de ça : il fournit une fonction t(cle, vars)
 *  qui renvoie un texte traduit en français, anglais ou espagnol, choisi
 *  avec la commande .lang.
 *
 *  Utilisation dans une commande :
 *    const { t } = require('../lib/i18n');
 *    citel.reply(t('ownerOnly'));
 *
 *  Pour ajouter une nouvelle phrase traduisible : l'ajouter dans les 3
 *  dictionnaires ci-dessous (fr / en / es) avec la même clé.
 */

if (!global.db) global.db = {};
if (!global.db.database) global.db.database = {};
if (!global.db.database.botIdentity) global.db.database.botIdentity = {};
if (!global.db.database.botIdentity.language) {
    global.db.database.botIdentity.language = 'fr'; // langue par défaut du bot
}

const DICT = {
    fr: {
        ownerOnly: "🚫 Cette commande est réservée au propriétaire du bot.",
        adminOnly: "🚫 Cette commande est réservée aux administrateurs du groupe.",
        groupOnly: "🚫 Cette commande fonctionne uniquement dans un groupe.",
        botAdminNeeded: "⚠️ Je dois être administrateur du groupe pour faire ça.",
        success: "✅ Fait.",
        linkMentionWarning: (user) => `*--- Lien détecté ---*\n@${user} vient d'envoyer un lien.\nPromeus-moi administrateur pour que je puisse retirer les personnes qui envoient des liens.`,
        linkOwnGroupSafe: "Je ne te retire pas pour l'envoi du lien de ce groupe.",
        linkDetectedRemoved: "🔗 Lien de groupe détecté ! Message supprimé.",
        langChanged: (lang) => `✅ Langue du bot changée en : *${lang}*`,
        langUsage: "_Exemple :_ *.lang fr* (ou *en*, *es*)",
        antispamOn: "✅ Anti-spam activé dans ce groupe.",
        antispamOff: "❎ Anti-spam désactivé dans ce groupe.",
        antispamUsage: "_Exemple :_ *.antispam on* ou *.antispam off*",
        antispamDetected: (user) => `🚨 *Anti-spam* : @${user} envoie des messages/fichiers de manière anormalement rapide.\nSes derniers messages ont été supprimés.`,
        antispamKicked: (user) => `🚨 @${user} a été retiré du groupe pour spam massif de fichiers.`
    },
    en: {
        ownerOnly: "🚫 This command is reserved for the bot owner.",
        adminOnly: "🚫 This command is reserved for group admins.",
        groupOnly: "🚫 This command only works in a group.",
        botAdminNeeded: "⚠️ I need to be a group admin to do that.",
        success: "✅ Done.",
        linkMentionWarning: (user) => `*--- Link detected ---*\n@${user} just sent a link.\nPromote me as admin so I can remove people who send links.`,
        linkOwnGroupSafe: "I won't remove you for sending this group's own link.",
        linkDetectedRemoved: "🔗 Group link detected! Message removed.",
        langChanged: (lang) => `✅ Bot language changed to: *${lang}*`,
        langUsage: "_Example:_ *.lang en* (or *fr*, *es*)",
        antispamOn: "✅ Anti-spam enabled in this group.",
        antispamOff: "❎ Anti-spam disabled in this group.",
        antispamUsage: "_Example:_ *.antispam on* or *.antispam off*",
        antispamDetected: (user) => `🚨 *Anti-spam*: @${user} is sending messages/files abnormally fast.\nTheir recent messages have been removed.`,
        antispamKicked: (user) => `🚨 @${user} was removed from the group for mass file spam.`
    },
    es: {
        ownerOnly: "🚫 Este comando está reservado para el propietario del bot.",
        adminOnly: "🚫 Este comando está reservado para los administradores del grupo.",
        groupOnly: "🚫 Este comando solo funciona en un grupo.",
        botAdminNeeded: "⚠️ Necesito ser administrador del grupo para hacer eso.",
        success: "✅ Hecho.",
        linkMentionWarning: (user) => `*--- Enlace detectado ---*\n@${user} acaba de enviar un enlace.\nHazme administrador para poder eliminar a quienes envían enlaces.`,
        linkOwnGroupSafe: "No te elimino por enviar el enlace de este mismo grupo.",
        linkDetectedRemoved: "🔗 ¡Enlace de grupo detectado! Mensaje eliminado.",
        langChanged: (lang) => `✅ Idioma del bot cambiado a: *${lang}*`,
        langUsage: "_Ejemplo:_ *.lang es* (o *fr*, *en*)",
        antispamOn: "✅ Antispam activado en este grupo.",
        antispamOff: "❎ Antispam desactivado en este grupo.",
        antispamUsage: "_Ejemplo:_ *.antispam on* o *.antispam off*",
        antispamDetected: (user) => `🚨 *Antispam*: @${user} está enviando mensajes/archivos de forma anormalmente rápida.\nSus mensajes recientes han sido eliminados.`,
        antispamKicked: (user) => `🚨 @${user} fue eliminado del grupo por spam masivo de archivos.`
    }
};

const SUPPORTED = Object.keys(DICT); // ['fr', 'en', 'es']

function getLang() {
    const lang = global.db.database.botIdentity.language;
    return SUPPORTED.includes(lang) ? lang : 'fr';
}

function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return false;
    global.db.database.botIdentity.language = lang;
    return true;
}

function t(key, ...args) {
    const lang = getLang();
    const entry = (DICT[lang] && DICT[lang][key]) || DICT.fr[key];
    if (!entry) return key;
    return typeof entry === 'function' ? entry(...args) : entry;
}

module.exports = { t, getLang, setLang, SUPPORTED };
