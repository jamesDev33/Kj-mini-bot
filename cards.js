// Anciennement basé sur mongoose — remplacé par le stockage local (localdb).
const { model } = require('./localdb')
const card = model('cards', { id: '', count: '0' })
module.exports = { card }
