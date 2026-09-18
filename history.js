/**
 * @project_name : MIKEY-PRIME-MD
 * @description : .history <sujet> — recherche un résumé/histoire réel sur n'importe quel
 *                 thème (satanisme, amour, guerre, mythologie, etc.) via Wikipédia.
 *                 S'adapte à la langue du bot (.lang fr/en/es) : la réponse arrive
 *                 directement dans la bonne langue, pas besoin de préciser.
 *                 Choix : recherche dynamique plutôt qu'un texte figé codé en dur, pour
 *                 que ça marche sur N'IMPORTE QUEL sujet, pas juste 1 ou 2 catégories.
 **/
const axios = require('axios');
const { cmd } = require('../lib');
const { getLang } = require('../lib/i18n');

// Wikipédia ne couvre pas "es" par défaut dans i18n.js (fr/en/es supportés) —
// on mappe direct la langue du bot vers le bon sous-domaine Wikipédia.
const WIKI_DOMAIN = { fr: 'fr', en: 'en', es: 'es' };

cmd(
    {
        pattern: "history",
        alias: ["histoire"],
        category: "RELIGION",
        desc: "Recherche l'histoire/le résumé d'un sujet, dans la langue actuelle du bot (.lang).",
        use: "satanisme",
        filename: __filename,
    },
    async (Void, citel, text) => {
        if (!text) {
            return citel.reply(
                "*_Utilisation :_* `.history <sujet>`\n" +
                "Exemples : `.history satanisme`, `.history amour`, `.history mythologie grecque`"
            );
        }
        const botLang = getLang();
        const wiki = WIKI_DOMAIN[botLang] || 'fr';
        try {
            const q = encodeURIComponent(text.trim());
            const { data } = await axios.get(
                `https://${wiki}.wikipedia.org/api/rest_v1/page/summary/${q}`,
                { timeout: 10000 }
            );
            if (!data || !data.extract) {
                return citel.reply("*_Aucun résultat trouvé pour ce sujet._*");
            }
            let out = `📜 *${data.title}*\n\n${data.extract}`;
            if (data.content_urls && data.content_urls.desktop) {
                out += `\n\n🔗 ${data.content_urls.desktop.page}`;
            }
            return citel.reply(out);
        } catch (e) {
            return citel.reply(
                "*_Aucun résultat pour ce terme._* Essaie un mot plus précis (ex: `satanisme`, `amour`, `guerre froide`, `mythologie nordique`)."
            );
        }
    }
);
