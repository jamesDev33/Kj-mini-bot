/**
 * @project_name : MIKEY-PRIME-MD
 * @description : Real anime action/reaction GIF commands (waifu.pics) + text-based fun generators.
 *                 Added to close the gap with bigger public menus WITHOUT padding the count with
 *                 numbered duplicates of the same feature.
 **/
const { cmd, getBuffer, fetchJson, Config } = require('../lib')

// ---------------------------------------------------------------------------
// ACTIONS / REACTIONS — each pattern below hits a DIFFERENT waifu.pics endpoint,
// so every command actually returns different content. No fake numbering.
// ---------------------------------------------------------------------------
const actions = [
    ["hug", "Envoie un câlin GIF à quelqu'un."],
    ["pat", "Envoie une petite tape affectueuse GIF."],
    ["kiss", "Envoie un bisou GIF."],
    ["cuddle", "Envoie un câlin tout doux GIF."],
    ["slap", "Envoie une baffe GIF."],
    ["kill", "Envoie un GIF... fatal."],
    ["kick", "Envoie un coup de pied GIF."],
    ["bite", "Envoie une petite morsure GIF."],
    ["bonk", "BONK GIF."],
    ["yeet", "YEET quelqu'un au loin, en GIF."],
    ["blush", "GIF de rougissement."],
    ["smile", "GIF de sourire."],
    ["wave", "GIF de coucou/salut."],
    ["highfive", "GIF de tape m'en cinq."],
    ["handhold", "GIF main dans la main."],
    ["nom", "GIF de quelqu'un qui croque/mange."],
    ["glomp", "GIF de câlin-plaquage surprise."],
    ["happy", "GIF de joie."],
    ["wink", "GIF de clin d'œil."],
    ["poke", "GIF de pichenette."],
    ["dance", "GIF de danse."],
    ["cringe", "GIF de cringe/malaise."],
    ["cry", "GIF de pleurs."],
    ["lick", "GIF de léchouille."],
    ["smug", "GIF d'air satisfait."],
    ["bully", "GIF de taquinerie."],
    ["awoo", "GIF awoo (loup/kemono)."],
    ["shinobu", "Image Shinobu SFW."],
    ["megumin", "Image Megumin SFW."],
];

for (const [name, desc] of actions) {
    cmd(
        {
            pattern: name,
            category: "fun",
            desc,
            filename: __filename,
        },
        async (Void, citel, text) => {
            try {
                const data = await fetchJson(`https://api.waifu.pics/sfw/${name}`);
                if (!data || !data.url) return citel.reply("*_Service indisponible pour le moment, réessaie plus tard._*");
                const buffer = await getBuffer(data.url);
                const mention = citel.quoted
                    ? [citel.quoted.sender]
                    : citel.mentionedJid && citel.mentionedJid.length
                        ? citel.mentionedJid
                        : [];
                return Void.sendMessage(
                    citel.chat,
                    {
                        image: buffer,
                        caption: text ? `*${text}*` : `*${Config.botname || "Bot"}*`,
                        mentions: mention,
                    },
                    { quoted: citel }
                );
            } catch (e) {
                console.log(`Error in .${name}:`, e);
                return citel.reply("*_Erreur lors de la récupération du média._*");
            }
        }
    );
}

// ---------------------------------------------------------------------------
// TEXT-BASED FUN GENERATORS — real, distinct logic, no external duplicate work.
// ---------------------------------------------------------------------------
cmd(
    { pattern: "8ball", category: "fun", desc: "Pose une question à la boule magique.", filename: __filename },
    async (Void, citel, text) => {
        if (!text) return citel.reply("*_Pose une question après la commande._*\nEx: `.8ball Est-ce que je vais réussir ?`");
        const answers = [
            "Oui, absolument.", "Sans aucun doute.", "C'est certain.", "Très probable.",
            "Les signes penchent vers oui.", "Réponse floue, retente plus tard.",
            "Ne compte pas dessus.", "Ma réponse est non.", "Les perspectives ne sont pas bonnes.",
            "Très douteux.", "Concentre-toi et redemande.",
        ];
        return citel.reply(`🎱 ${answers[Math.floor(Math.random() * answers.length)]}`);
    }
);

cmd(
    { pattern: "compliment", category: "fun", desc: "Envoie un compliment.", filename: __filename },
    async (Void, citel, text) => {
        const list = [
            "Tu illumines chaque pièce où tu entres.", "Ton énergie est contagieuse.",
            "T'es quelqu'un de vraiment fiable.", "Ton sourire change la journée de quelqu'un.",
            "T'as un goût impeccable.", "Tu progresses plus que tu ne le penses.",
        ];
        const target = text || "toi";
        return citel.reply(`💫 ${target} : ${list[Math.floor(Math.random() * list.length)]}`);
    }
);

cmd(
    { pattern: "roast", category: "fun", desc: "Envoie un roast (pour rire).", filename: __filename },
    async (Void, citel, text) => {
        const list = [
            "T'es tellement lent que même le chargement de WhatsApp Web te bat.",
            "T'as l'air d'un tuto YouTube : plein de pub avant d'arriver au sujet.",
            "Si la flemme était un sport, t'aurais une médaille.",
            "T'es la preuve vivante que le Wi-Fi de quelqu'un a des limites.",
        ];
        const target = text || "toi";
        return citel.reply(`🔥 ${target} : ${list[Math.floor(Math.random() * list.length)]}`);
    }
);

cmd(
    { pattern: "ship", alias: ["compatibility"], category: "fun", desc: "Calcule un pourcentage d'amour entre deux noms.", filename: __filename },
    async (Void, citel, text) => {
        if (!text || !text.includes(" ")) return citel.reply("*_Utilisation :_* `.ship Nom1 Nom2`");
        const [a, b] = text.split(" ").filter(Boolean);
        let hash = 0;
        const combo = (a + b).toLowerCase();
        for (let i = 0; i < combo.length; i++) hash = (hash * 31 + combo.charCodeAt(i)) >>> 0;
        const pct = hash % 101;
        const bar = "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10));
        return citel.reply(`💘 ${a} + ${b} = ${pct}%\n${bar}`);
    }
);

cmd(
    { pattern: "aura", category: "fun", desc: "Donne un score d'aura aléatoire.", filename: __filename },
    async (Void, citel, text) => {
        const score = Math.floor(Math.random() * 4001) - 2000;
        return citel.reply(`✨ Aura : ${score > 0 ? "+" : ""}${score}`);
    }
);

cmd(
    { pattern: "rate", category: "fun", desc: "Note quelque chose sur 10.", filename: __filename },
    async (Void, citel, text) => {
        if (!text) return citel.reply("*_Utilisation :_* `.rate <chose>`");
        const score = Math.floor(Math.random() * 11);
        return citel.reply(`📊 Je note "${text}" : ${score}/10`);
    }
);

cmd(
    { pattern: "pickup", category: "fun", desc: "Envoie une pickup line random.", filename: __filename },
    async (Void, citel, text) => {
        const list = [
            "T'es wifi ? Parce que je sens une connexion.",
            "T'es un aimant et moi le métal, je suis attiré vers toi.",
            "Si t'étais un légume, tu serais une carotte, parce que t'es canon.",
        ];
        return citel.reply(`😏 ${list[Math.floor(Math.random() * list.length)]}`);
    }
);

cmd(
    { pattern: "wyr", category: "fun", desc: "Envoie un 'tu préfères' (would you rather).", filename: __filename },
    async (Void, citel, text) => {
        const list = [
            "Tu préfères pouvoir voler ou être invisible ?",
            "Tu préfères perdre ton téléphone ou ton portefeuille ?",
            "Tu préfères parler toutes les langues ou jouer de tous les instruments ?",
        ];
        return citel.reply(`🤔 ${list[Math.floor(Math.random() * list.length)]}`);
    }
);
