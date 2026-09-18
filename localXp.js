/**
 * localXp.js — Remplace le package "discord-xp" (qui exigeait Mongo).
 * Même API utilisée dans le bot : setURL, fetch, appendXp, xpFor, fetchLeaderboard.
 * Stockage 100% local via localdb.
 */
const { model } = require('./localdb')

const XpModel = model('levels', { userID: '', guildID: '', xp: 0, level: 0 })

function xpFor(level) {
    // Courbe de progression : plus le niveau est haut, plus l'XP requis augmente.
    level = Number(level) || 0
    return Math.floor(5 * (level ** 2) + 50 * level + 100)
}

function key(userID, guildID) { return `${userID}__${guildID}` }

async function fetch(userID, guildID) {
    let doc = await XpModel.findOne({ id: key(userID, guildID) })
    if (!doc) {
        doc = await new XpModel({ id: key(userID, guildID), userID, guildID, xp: 0, level: 0 }).save()
    }
    return doc
}

async function appendXp(userID, guildID, xp) {
    const doc = await fetch(userID, guildID)
    const newXp = (doc.xp || 0) + Number(xp)
    let newLevel = doc.level || 0
    let leveledUp = false
    while (newXp >= xpFor(newLevel + 1)) {
        newLevel += 1
        leveledUp = true
    }
    await XpModel.updateOne({ id: key(userID, guildID) }, { xp: newXp, level: newLevel })
    return leveledUp
}

async function setXp(userID, guildID, xp) {
    await fetch(userID, guildID)
    await XpModel.updateOne({ id: key(userID, guildID) }, { xp: Number(xp) })
    return true
}

async function setLevel(userID, guildID, level) {
    await fetch(userID, guildID)
    await XpModel.updateOne({ id: key(userID, guildID) }, { level: Number(level) })
    return true
}

async function fetchLeaderboard(guildID, limit = 10) {
    const all = await XpModel.find({ guildID })
    return all.sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, limit)
}

function setURL() {
    // Pas de base distante à connecter : conservé pour compatibilité d'API.
    return true
}

function computeLeaderboard(userID) {
    return userID
}

module.exports = { setURL, fetch, appendXp, setXp, setLevel, xpFor, fetchLeaderboard, computeLeaderboard }
