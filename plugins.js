// Anciennement basé sur mongoose — remplacé par le stockage local (localdb).
const { model } = require('./localdb')
const plugindb = model('plugins', { id: '', url: '' })
module.exports = { plugindb }
