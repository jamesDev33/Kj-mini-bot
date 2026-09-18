// Anciennement basé sur mongoose — remplacé par le stockage local (localdb).
const { model } = require('./localdb')
const warndb = model('warn', {
    id: '',
    reason: 'No Reason',
    date: () => Date.now(),
    group: 'In Private chat',
    warnedby: 'false',
})
module.exports = { warndb }
