const fs = require('fs-extra')
if (fs.existsSync('config.env')) require('dotenv').config({ path: __dirname + '/config.env' })

// Configuration sécurisée : les secrets et informations personnelles doivent être
// fournis via les variables d'environnement (Koyeb, local, etc.).
global.owner = process.env.OWNER_NUMBER || '242061691195'
global.port = process.env.PORT || 5000
global.email = process.env.OWNER_EMAIL || ''
global.github = process.env.GITHUB_URL || ''
global.location = process.env.BOT_LOCATION || ''
global.gurl = process.env.SOCIAL_URL || ''
global.sudo = process.env.SUDO || ''
global.devs = process.env.DEV_NUMBER || ''
global.website = process.env.WEBSITE_URL || ''
global.THUMB_IMAGE = process.env.THUMB_IMAGE || 'https://telegra.ph/file/3c341828d86ee7a89c73f.jpg'

module.exports = {
  sessionName: process.env.SESSION_ID || '',
  author: process.env.PACK_AUTHER || 'MIKEY PRIME 999',
  packname: process.env.PACK_NAME || 'MIKEY PRIME 999',
  botname: process.env.BOT_NAME || '≛⃝꥓𝑴𝑰𝑲𝑬𝒀 ᵖʳᶦᵐᵉ𓆩ㅤ ⁹⁹⁹',
  ownername: process.env.OWNER_NAME || 'Mikey prime',
  auto_read_status: process.env.AUTO_READ_STATUS === undefined ? false : process.env.AUTO_READ_STATUS,
  autoreaction: process.env.AUTO_REACTION === undefined ? false : process.env.AUTO_REACTION,
  antibadword: process.env.ANTI_BAD_WORD === undefined ? 'nbwoed' : process.env.ANTI_BAD_WORD,
  alwaysonline: process.env.ALWAYS_ONLINE === undefined ? false : process.env.ALWAYS_ONLINE,
  antifake: process.env.FAKE_COUNTRY_CODE === undefined ? '971' : process.env.FAKE_COUNTRY_CODE,
  readmessage: process.env.READ_MESSAGE === undefined ? false : process.env.READ_MESSAGE,
  auto_status_saver: process.env.AUTO_STATUS_SAVER === undefined ? false : process.env.AUTO_STATUS_SAVER,
  HANDLERS: process.env.PREFIX === undefined ? '.' : process.env.PREFIX,
  warncount: process.env.WARN_COUNT === undefined ? 3 : process.env.WARN_COUNT,
  disablepm: process.env.DISABLE_PM === undefined ? false : process.env.DISABLE_PM,
  levelupmessage: process.env.LEVEL_UP_MESSAGE === undefined ? false : process.env.LEVEL_UP_MESSAGE,
  antilink: process.env.ANTILINK_VALUES === undefined ? 'chat.whatsapp.com' : process.env.ANTILINK_VALUES,
  antilinkaction: process.env.ANTILINK_ACTION === undefined ? 'remove' : process.env.ANTILINK_ACTION,
  BRANCH: process.env.BRANCH || 'main',
  ALIVE_MESSAGE: process.env.ALIVE_MESSAGE === undefined ? '≛⃝꥓𝑴𝑰𝑲𝑬𝒀 ᵖʳᶦᵐᵉ𓆩ㅤ ⁹⁹⁹\nᗪᗴᗰOᑎ ᑭᑌᖇᘜᗴᗪ Tᗴᑕᕼ\n\n⚡ Bot opérationnel.' : process.env.ALIVE_MESSAGE,
  autobio: process.env.AUTO_BIO === undefined ? false : process.env.AUTO_BIO,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || false,
  heroku: process.env.heroku || false,
  HEROKU: {
    HEROKU: process.env.HEROKU || false,
    API_KEY: process.env.HEROKU_API_KEY || '',
    APP_NAME: process.env.HEROKU_APP_NAME || ''
  },
  VERSION: process.env.VERSION || 'MIKEY-PRIME-999 v1.0',
  LANG: process.env.THEME || 'GOJO',
  WORKTYPE: process.env.WORKTYPE || 'public'
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(`Update '${__filename}'`)
  delete require.cache[file]
  require(file)
})
