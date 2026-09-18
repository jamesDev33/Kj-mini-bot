// Anciennement basé sur mongoose — remplacé par le stockage local (localdb).
const { model } = require('./localdb')
const chatbot = model('chatbot', { id: '', worktype: 'false' })
module.exports = { chatbot }
