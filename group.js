// Anciennement basé sur mongoose — remplacé par le stockage local (localdb).
const { model } = require('./localdb')
const sck = model('group', {
    id: '',
    events: 'false',
    nsfw: 'false',
    welcome: '@pp╭┈─⊹⊱ 𝑩𝑰𝑬𝑵𝑽𝑬𝑵𝑼𝑬 ⊰⊹─┈╮\n┊ 👋 Salut @user !\n┊ 🏠 Groupe : @gname\n┊ 👥 Membre n° @count\n╰┈─⊹⊱───────────⊰⊹─┈╯',
    goodbye: '@pp╭┈─⊹⊱ 𝑨𝑼 𝑹𝑬𝑽𝑶𝑰𝑹 ⊰⊹─┈╮\n┊ 😢 @user vient de quitter\n┊ 🏠 Groupe : @gname\n┊ 👥 Il reste @count membre(s)\n╰┈─⊹⊱───────────⊰⊹─┈╯',
    botenable: 'true',
    activitygame: 'false',
    antilink: 'false',
    antispam: 'false',
    economy: 'false',
    mute: '',
    unmute: '',
})
module.exports = { sck }
