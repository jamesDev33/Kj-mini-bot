// Anciennement basé sur mongoose — remplacé par le stockage local (localdb).
const { model } = require('./localdb')
const haigu = model('haigusha', { id: '', haig: 'false' })
module.exports = { haigu }
