/**
 * .activitygame on|off — active/désactive un classement fun toutes les heures :
 * la personne qui a écrit le plus de messages dans l'heure reçoit un titre
 * marrant et positif (aucune insulte, même ton pour tout le monde).
 * Le comptage + l'annonce sont câblés dans lib/client.js (même approche que
 * l'anti-spam : compteur en mémoire vérifié à chaque message du groupe).
 */
const { cmd, sck, getAdmin } = require('../lib');
const { t } = require('../lib/i18n');

cmd({
    pattern: "activitygame",
    alias: ["actifgame", "jeuactivite"],
    desc: "Active/désactive le classement fun de la personne la plus active de l'heure.",
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
        return citel.reply("_Exemple :_ *.activitygame on* ou *.activitygame off*");
    }

    await sck.findOne({ id: citel.chat }) || await new sck({ id: citel.chat }).save();
    await sck.updateOne({ id: citel.chat }, { activitygame: choice === 'on' ? 'true' : 'false' });

    if (global.activityTrack) delete global.activityTrack[citel.chat];

    return citel.reply(
        choice === 'on'
            ? "🎉 *Classement d'activité activé !* Toutes les heures, la personne qui a le plus écrit reçoit un titre fun."
            : "❎ Classement d'activité désactivé."
    );
});
