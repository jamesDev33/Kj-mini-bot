// Anciennement basé sur mongoose — remplacé par le stockage local (localdb).
const { model } = require('./localdb')
const notes = model('notes', { id: '', note: 'false' })
module.exports = { notes }
