/**
 * ===========================================================================
 *  XMENU — Menu ultra futuriste + police personnalisable + lien personnalisé
 *  Ajouté pour Dark Evil sur MIKEY-PRIME-MD.
 * ===========================================================================
 *
 *  Commandes ajoutées ici :
 *    .xmenu             -> affiche le menu complet, façon "futuriste"
 *    .menufont          -> affiche un aperçu des polices disponibles
 *    .menufont <numéro> -> choisit la police utilisée pour le menu (persistant)
 *
 *  La police choisie et le lien personnalisé (voir commands/botidentity.js)
 *  sont stockés dans global.db.database.botIdentity, qui est le même système
 *  de sauvegarde JSON déjà utilisé partout ailleurs dans ce bot
 *  (fichier lib/database.json, ré-écrit automatiquement toutes les 10s).
 */

const os = require('os');
const moment = require('moment-timezone');
const {
    cmd,
    Config,
    prefix,
    fancytext,
    listall,
    runtime,
    formatp,
    botpic,
    tlang
} = require('../lib');

// ---------------------------------------------------------------------------
// Stockage persistant (créé s'il n'existe pas encore)
// ---------------------------------------------------------------------------
if (!global.db.database) global.db.database = {};
if (!global.db.database.botIdentity) {
    global.db.database.botIdentity = {
        customLink: '',      // lien perso affiché dans le menu (voir botidentity.js)
        linkLocked: false,
        menuFont: 24         // 24 = police italique par défaut (𝑇𝑒𝑠𝑡)
    };
}
// Compat si botidentity.js n'a pas encore tourné une première fois
if (global.db.database.botIdentity.menuFont === undefined) {
    global.db.database.botIdentity.menuFont = 24;
}

function getFont() {
    return global.db.database.botIdentity.menuFont || 24;
}

function style(text) {
    try {
        const styled = fancytext(text, getFont());
        return styled || text;
    } catch (e) {
        return text;
    }
}

function getChannelLine() {
    const identity = global.db.database.botIdentity;
    if (identity.customLink && identity.linkLocked) {
        return identity.customLink;
    }
    return global.gurl || 'https://whatsapp.com/channel/xxxxxxxxxxxxxxxxxxxx';
}

// ---------------------------------------------------------------------------
// .menufont — aperçu et sélection de la police du menu
// ---------------------------------------------------------------------------
cmd({
    pattern: "menufont",
    alias: ["fontmenu", "setfont"],
    desc: "Aperçu ou changement de la police utilisée pour le menu (.xmenu).",
    category: "settings",
    use: '[numéro de police]',
    filename: __filename
}, async (Void, citel, text) => {
    const samples = listall('MenuStyle');
    const total = samples.length;

    if (!text || !text.trim()) {
        let out = `*🖋️ Polices disponibles pour ${prefix}xmenu (1-${total})*\n\n`;
        for (let i = 0; i < total; i++) {
            out += `*${i + 1}.* ${samples[i]}\n`;
        }
        out += `\n_Police actuelle : *${getFont()}*_\n`;
        out += `_Pour choisir :_ *${prefix}menufont <numéro>*`;
        return citel.reply(out);
    }

    const choice = parseInt(text.trim(), 10);
    if (isNaN(choice) || choice < 1 || choice > total) {
        return citel.reply(`_Numéro invalide. Choisis un nombre entre 1 et ${total}._\nExemple : *${prefix}menufont 24*`);
    }

    global.db.database.botIdentity.menuFont = choice;
    return citel.reply(
        `✅ Police du menu mise à jour !\n\n` +
        `*Aperçu :* ${samples[choice - 1]}\n\n` +
        `_Tape ${prefix}xmenu pour voir le résultat._`
    );
});

// ---------------------------------------------------------------------------
// .xmenu — menu principal, futuriste, façon "carte holographique"
// ---------------------------------------------------------------------------
cmd({
    pattern: "xmenu",
    alias: ["futuremenu", "menux"],
    desc: "Menu complet du bot, avec un style visuel futuriste.",
    category: "general",
    react: "🛸",
    filename: __filename
}, async (Void, citel) => {
    const { commands } = require('../lib');

    const grouped = {};
    commands.forEach((c) => {
        if (c.dontAddCommandList) return;
        if (!c.pattern) return;
        const cat = (c.category || 'misc').toUpperCase();
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(c.pattern);
    });

    const uptime = runtime(process.uptime());
    const mem = `${formatp(os.totalmem() - os.freemem())}/${formatp(os.totalmem())}`;
    const now = moment().format('DD/MM/YYYY HH:mm:ss');
    const ownerLabel = style('Owner');
    const ownerNumberLabel = style('Ownernumber');
    const prefixLabel = style('Prefix');
    const channelLabel = style('Channel');

    let menu = `╭┈─⊹⊱ ${style(Config.ownername.split(' ')[0] || 'BOT')} ⊰⊹─┈╮\n`;
    menu += `┊ ${ownerLabel} : ${Config.ownername}\n`;
    menu += `┊ ${ownerNumberLabel} : +${(global.owner || '').split(',')[0]}\n`;
    menu += `┊ ${prefixLabel} : [ ${prefix} ]\n`;
    menu += `┊ ${style('Commands')} : ${commands.length}\n`;
    menu += `┊ ${style('Uptime')} : ${uptime}\n`;
    menu += `┊ ${style('Ram')} : ${mem}\n`;
    menu += `┊ ${style('Date')} : ${now}\n`;
    menu += `┊ ${channelLabel} : ${getChannelLine()}\n`;
    menu += `╰┈─⊹⊱───────────⊰⊹─┈╯\n\n`;

    for (const cat in grouped) {
        menu += `『 ${style(cat)} 』\n`;
        menu += `╭───────────────────⊷\n`;
        for (const pattern of grouped[cat]) {
            menu += `┋ ⬡ ${prefix}${pattern}\n`;
        }
        menu += `╰───────────────────⊷\n`;
    }

    menu += `\n\n✓𝐵𝑦 𝑀𝐼𝐾𝐸𝑌 𝑃𝑅𝐼𝑀𝐸 𝑒𝑑𝑖𝑡𝑑.𝑣6`;

    return await Void.sendMessage(citel.chat, { image: { url: await botpic() }, caption: menu }, { quoted: citel });
});
