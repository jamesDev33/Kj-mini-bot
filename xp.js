// Anciennement basé sur mongoose — remplacé par le stockage local (localdb).
// Conservé pour compatibilité (le vrai système de niveaux est dans localXp.js).
const { model } = require('./localdb')
const RandomXP = model('randomxp', { level: 'false' })
module.exports = { RandomXP }
