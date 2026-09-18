/**
 * localdb.js — Petit moteur de base de données 100% local (fichiers JSON).
 *
 * Remplace complètement MongoDB / mongoose : aucune connexion réseau,
 * aucune URI, aucun service externe requis. Toutes les données sont
 * stockées dans /database/*.json à la racine du projet.
 *
 * L'API exposée (findOne, find, updateOne, deleteOne, findOneAndDelete,
 * countDocuments, collection.drop, new Model(data).save()) reproduit le
 * sous-ensemble de l'API mongoose réellement utilisé par MIKEY PRIME,
 * pour que tous les fichiers de commandes fonctionnent sans modification.
 */
const fs = require('fs')
const path = require('path')

const DB_DIR = path.join(__dirname, '..', '..', 'database')
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })

// Cache mémoire pour éviter de relire le disque à chaque appel.
const cache = new Map()

function fileFor(name) {
    return path.join(DB_DIR, `${name}.json`)
}

function loadCollection(name) {
    if (cache.has(name)) return cache.get(name)
    const file = fileFor(name)
    let data = []
    if (fs.existsSync(file)) {
        try {
            const raw = fs.readFileSync(file, 'utf8')
            data = raw.trim() ? JSON.parse(raw) : []
        } catch (e) {
            console.log(`[localdb] fichier corrompu, réinitialisation: ${name}.json`)
            data = []
        }
    } else {
        fs.writeFileSync(file, '[]')
    }
    cache.set(name, data)
    return data
}

function saveCollection(name, data) {
    cache.set(name, data)
    fs.writeFileSync(fileFor(name), JSON.stringify(data, null, 2))
}

function matches(doc, filter = {}) {
    return Object.keys(filter).every((key) => {
        const val = filter[key]
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            if ('$in' in val) return Array.isArray(val.$in) && val.$in.includes(doc[key])
            if ('$ne' in val) return doc[key] !== val.$ne
        }
        return doc[key] === val
    })
}

class LocalQuery {
    constructor(model, filter = {}) {
        this.model = model
        this.filter = { ...filter }
    }
    where(field) {
        const self = this
        return {
            in(arr) { self.filter[field] = { $in: arr }; return self.exec() },
            eq(val) { self.filter[field] = val; return self.exec() },
            ne(val) { self.filter[field] = { $ne: val }; return self.exec() },
        }
    }
    exec() {
        const data = loadCollection(this.model.collectionName)
        return Promise.resolve(data.filter((d) => matches(d, this.filter)))
    }
    then(resolve, reject) { return this.exec().then(resolve, reject) }
    catch(reject) { return this.exec().catch(reject) }
}

/**
 * Crée un "modèle" local. `defaults` définit les valeurs par défaut des
 * champs (équivalent des `default:` dans un schema mongoose).
 */
function model(collectionName, defaults = {}) {
    class Model {
        constructor(data = {}) {
            Object.assign(this, JSON.parse(JSON.stringify(defaults)), data)
        }
        async save() {
            const data = loadCollection(collectionName)
            const plain = { ...this }
            const idx = ('id' in plain) ? data.findIndex((d) => d.id === plain.id) : -1
            if (idx >= 0) data[idx] = { ...data[idx], ...plain }
            else data.push(plain)
            saveCollection(collectionName, data)
            return plain
        }
    }
    Model.collectionName = collectionName

    Model.findOne = async (filter = {}) => {
        const data = loadCollection(collectionName)
        return data.find((d) => matches(d, filter)) || null
    }

    Model.find = (filter = {}) => new LocalQuery(Model, filter)

    Model.updateOne = async (filter = {}, update = {}) => {
        const data = loadCollection(collectionName)
        const idx = data.findIndex((d) => matches(d, filter))
        if (idx === -1) {
            // Comportement "upsert" : crée le document s'il n'existe pas encore.
            const created = { ...JSON.parse(JSON.stringify(defaults)), ...filter, ...update }
            data.push(created)
            saveCollection(collectionName, data)
            return created
        }
        data[idx] = { ...data[idx], ...update }
        saveCollection(collectionName, data)
        return data[idx]
    }

    Model.deleteOne = async (filter = {}) => {
        const data = loadCollection(collectionName)
        const idx = data.findIndex((d) => matches(d, filter))
        if (idx === -1) return null
        const [removed] = data.splice(idx, 1)
        saveCollection(collectionName, data)
        return removed
    }
    Model.findOneAndDelete = Model.deleteOne

    Model.countDocuments = async (filter = {}) => {
        const data = loadCollection(collectionName)
        return data.filter((d) => matches(d, filter)).length
    }

    Model.collection = {
        drop: async () => { saveCollection(collectionName, []); return true },
    }

    return Model
}

module.exports = { model }
