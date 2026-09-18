// Anciennement basé sur mongoose — remplacé par le stockage local (localdb).
const { model } = require('./localdb')
const sck1 = model('user', {
    id: '',
    name: '',
    bot: false,
    announcement: '',
    permit: 'false',
    afk: 'false',
    afktime: 0,
    times: 0,
    ban: 'false',
    haig: 'false',
})
module.exports = { sck1 }
