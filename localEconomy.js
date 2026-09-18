/**
 * localEconomy.js — Remplace "discord-mongoose-economy" (qui exigeait Mongo).
 * Même API utilisée dans le bot : connect, balance, give, deduct, deposit,
 * withdraw, daily, giveCapacity, lb.
 * Stockage 100% local via localdb.
 */
const { model } = require('./localdb')

const DEFAULT_CAPACITY = 5000

const EcoModel = model('economy', {
    userID: '',
    currency: '',
    wallet: 0,
    bank: 0,
    bankCapacity: DEFAULT_CAPACITY,
    lastDaily: 0,
})

function key(userID, currency) { return `${userID}__${currency}` }

async function ensure(userID, currency) {
    let doc = await EcoModel.findOne({ id: key(userID, currency) })
    if (!doc) {
        doc = await new EcoModel({
            id: key(userID, currency),
            userID,
            currency,
            wallet: 0,
            bank: 0,
            bankCapacity: DEFAULT_CAPACITY,
            lastDaily: 0,
        }).save()
    }
    return doc
}

function connect() {
    // Aucune connexion distante nécessaire ; conservé pour compatibilité d'API.
    return Promise.resolve(true)
}

async function balance(userID, currency) {
    const doc = await ensure(userID, currency)
    return { wallet: doc.wallet, bank: doc.bank, bankCapacity: doc.bankCapacity }
}

async function give(userID, currency, amount) {
    const doc = await ensure(userID, currency)
    const wallet = doc.wallet + Math.max(0, Number(amount) || 0)
    await EcoModel.updateOne({ id: key(userID, currency) }, { wallet })
    return { wallet, bank: doc.bank, bankCapacity: doc.bankCapacity }
}

async function deduct(userID, currency, amount) {
    const doc = await ensure(userID, currency)
    const wallet = Math.max(0, doc.wallet - (Math.abs(Number(amount)) || 0))
    await EcoModel.updateOne({ id: key(userID, currency) }, { wallet })
    return { wallet, bank: doc.bank, bankCapacity: doc.bankCapacity }
}

async function deposit(userID, currency, amount) {
    const doc = await ensure(userID, currency)
    const value = Math.abs(Number(amount)) || 0
    const room = doc.bankCapacity - doc.bank
    const moved = Math.min(value, room, doc.wallet)
    const wallet = doc.wallet - moved
    const bank = doc.bank + moved
    await EcoModel.updateOne({ id: key(userID, currency) }, { wallet, bank })
    return { wallet, bank, bankCapacity: doc.bankCapacity }
}

async function withdraw(userID, currency, amount) {
    const doc = await ensure(userID, currency)
    const value = Math.abs(Number(amount)) || 0
    const moved = Math.min(value, doc.bank)
    const wallet = doc.wallet + moved
    const bank = doc.bank - moved
    await EcoModel.updateOne({ id: key(userID, currency) }, { wallet, bank })
    return { wallet, bank, bankCapacity: doc.bankCapacity }
}

async function giveCapacity(userID, currency, amount) {
    const doc = await ensure(userID, currency)
    const bankCapacity = doc.bankCapacity + (Number(amount) || 0)
    await EcoModel.updateOne({ id: key(userID, currency) }, { bankCapacity })
    return { wallet: doc.wallet, bank: doc.bank, bankCapacity }
}

async function daily(userID, currency, amount) {
    const doc = await ensure(userID, currency)
    const now = Date.now()
    const DAY = 24 * 60 * 60 * 1000
    if (doc.lastDaily && now - doc.lastDaily < DAY) {
        const remaining = DAY - (now - doc.lastDaily)
        return { claimed: false, remaining, wallet: doc.wallet }
    }
    const wallet = doc.wallet + (Number(amount) || 0)
    await EcoModel.updateOne({ id: key(userID, currency) }, { wallet, lastDaily: now })
    return { claimed: true, wallet }
}

async function lb(currency, limit = 10) {
    const all = await EcoModel.find({ currency })
    return all
        .sort((a, b) => b.wallet - a.wallet)
        .slice(0, limit)
        .map((d) => ({ userID: d.userID, wallet: d.wallet, bank: d.bank, bankCapacity: d.bankCapacity }))
}

module.exports = { connect, balance, give, deduct, deposit, withdraw, giveCapacity, daily, lb }
