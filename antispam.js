/**
 * .antispam on|off — active/désactive la suppression automatique des
 * messages d'un utilisateur qui envoie des fichiers/messages en rafale
 * (comportement typique des comptes "marabout"/spam).
 * La détection elle-même est câblée dans lib/client.js.
 * Ajouté pour Dark Evil.
 */
const { cmd, sck, prefix, getAdmin } = require('../lib');
const { t } = require('../lib/i18n');

cmd({
    pattern: "antispam",
    desc: "Active ou désactive l'anti-spam de fichiers dans le groupe.",
    category: "group",
    use: '<on|off>',
    filename: __filename
}, async (Void, citel, text, { isCreator }) => {
    if (!citel.isGroup) return citel.reply(t('groupOnly'));

    const groupAdmins = await getAdmin(Void, citel);
    const isAdmins = groupAdmins.includes(citel.sender);
    if (!isAdmins && !isCreator) return citel.reply(t('adminOnly'));

    const choice = (text || '').trim().toLowerCase();
    if (choice !== 'on' && choice !== 'off') {
        return citel.reply(t('antispamUsage'));
    }

    await sck.findOne({ id: citel.chat }) || await new sck({ id: citel.chat }).save();
    await sck.updateOne({ id: citel.chat }, { antispam: choice === 'on' ? 'true' : 'false' });

    return citel.reply(choice === 'on' ? t('antispamOn') : t('antispamOff'));
});
