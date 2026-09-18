/**
 * .lang fr|en|es — change la langue des messages du bot
 * (antilink, anti-spam, messages de permission, etc.)
 * Ajouté pour Dark Evil.
 */
const { cmd, prefix } = require('../lib');
const { t, setLang, getLang, SUPPORTED } = require('../lib/i18n');

cmd({
    pattern: "lang",
    alias: ["language", "langue"],
    desc: "Change la langue des réponses du bot (fr, en, es).",
    category: "settings",
    use: '<fr|en|es>',
    filename: __filename
}, async (Void, citel, text) => {
    if (!text || !text.trim()) {
        return citel.reply(
            `🌐 *Langue actuelle :* ${getLang()}\n` +
            `_Langues disponibles :_ ${SUPPORTED.join(', ')}\n\n` +
            t('langUsage')
        );
    }

    const choice = text.trim().toLowerCase();
    if (!setLang(choice)) {
        return citel.reply(`_Langue non supportée. Choisis parmi :_ ${SUPPORTED.join(', ')}`);
    }

    return citel.reply(t('langChanged', choice));
});
