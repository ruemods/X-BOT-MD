const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    getAggregateVotesInPollMessage,
    makeInMemoryStore,
    jidNormalizedUser,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const axios = require('axios');
const {
    Boom
} = require('@hapi/boom');
const P = require('pino');
const path = require('path');
const fs = require('fs');
const web = require('./lib/server.js');
const MsgHandler = require('./lib/handler.js')
const cron = require('node-cron');
const {
    GevPlugin,
    PluginInstall
} = require("./lib/database/ext_plugins.js");
const got = require("got");
const X = require("./config.js")
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const config = require("./config");
///////////////
async function MakeSession() {
    try {
        console.log("ᴡʀɪᴛᴛɪɴɢ sᴇssɪᴏɴ");
	if (!X.SESSION_ID) {
		console.log('please provide a session id');
		console.log('please provide a session id');
		console.log('please provide a session id');
		await sleep(10000);
		process.exit(1);
	}
         const {
          data
        } = await axios(`https://gist.github.com/ESWIN-SPERKY/${X.SESSION_ID.split(':')[1]}/raw`);
        await fs.writeFileSync("./lib/session/creds.json", JSON.stringify(data));
        console.log("sᴇssɪᴏɴ ᴄʀᴇᴀᴛᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ");
      } catch (e) {
        console.log(e);
      }
}
MakeSession()
//////////////////

async function Sparky() {

    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(
        "./lib/session"
    );

    /////////////////////////////////////////////

    const client = makeWASocket({
        auth: state,
        browser: Browsers.macOS("Desktop"),//[ "Ubuntu","Chrome", "20.0.04" ],
        downloadHistory: false,
        syncFullHistory: false,
        logger: P({
            level: "silent"
        }),
        printQRInTerminal: true,
        emitOwnEvents: true,/*,
        getMessage: async (key) =>

        (store.loadMessage(key.id) || {}).message || {
            conversation: null
        }*/
    })

    /////////////////////////////////////////////
    /*
    const store = makeInMemoryStore({
        logger: P().child({
            level: 'silent', stream: 'store'
        })
    })

    store.bind(client.ev);

    setInterval(() => {

        store.writeToFile("./database/store.json");

    }, 30 * 1000);
*/
    /////////////////////////////////////////////

    client.ev.on('connection.update', (update) => {
        const {
            connection,
            lastDisconnect
        } = update;
        if (connection === "connecting") {
            console.clear()
            console.log("ᴄᴏɴɴᴇᴄᴛɪɴɢ ...");
        }
        if (connection === "open") {
            const invisibleCharacters = String.fromCharCode(0x200e).repeat(0xfa1);
            var sudoId = (X.SUDO !== '' ? X.SUDO.split(',')[0] : client.user.id.split(':')[0]) + "@s.whatsapp.net";
            var startupMessage = "*_X BOT MD STARTED!_*" + invisibleCharacters + 
            "\n\n_MODE       :_ *" + X.WORK_TYPE +
            "*\n_SUDO_       _: *" + X.SUDO + 
            "*_\n_PREFIX_     _: *" + X.HANDLERS + 
            "*_\n_VERSION_  _: *" + X.VERSION +
            "*_\n\n*_Extra Configurations_*\n\n_Always online_ " + (X.ALWAYS_ONLINE == "true" ? '✅' : '❌') + 
            "\n_Auto status viewer_ " + (X.AUTO_STATUS_VIEW == "true" ? '✅' : '❌') + 
            "\n_Auto reject calls_ " + (X.REJECT_CALLS == "true" ? '✅' : '❌') +
           "\n_Auto read msgs_ " + (X.READ_MESSAGES == "true" ? '✅' : '❌') + 
           "\n_PM Blocker_" + (X.PM_BLOCK == "true" ? '✅' : '❌') +
           "\n_PM Disabler_" + (X.DISABLE_PM == "true" ? '✅' : '❌');
        
                  client.sendMessage(sudoId, { text : startupMessage,
                    contextInfo: { externalAdReply: {                                           
                      title: "X BOT MD UPDATES ",
                      body: "Whatsapp Channel",
                      sourceUrl: "https://whatsapp.com/channel/0029Va9ZOf36rsR1Ym7O2x00",
                      mediaUrl: "https://whatsapp.com/channel/0029Va9ZOf36rsR1Ym7O2x00",
                      mediaType: 1,
                      showAdAttribution: false,
                      renderLargerThumbnail: false,
                      thumbnailUrl: "https://i.imgur.com/Q2UNwXR.jpg" }}
                   },{ quoted: false })
            console.log("ᴄᴏɴɴᴇᴄᴛᴇᴅ");
            config.DATABASE.sync();
            console.log("Connecting to database...");
            async function mm() {
            var plugins = await GevPlugin.findAll();
        plugins.map(async (plugin) => {
            if (!fs.existsSync('./plugins/' + plugin.dataValues.name + '.js')) {
                var response = await got(plugin.dataValues.url);
                if (response.statusCode == 200) {
              fs.writeFileSync('./plugins/' + plugin.dataValues.name + '.js', response.body);
                    require('./plugins/' + plugin.dataValues.name + '.js');
console.log("ᴇxᴛᴇʀɴᴀʟ ᴘʟᴜɢɪɴs ɪɴsᴛᴀʟʟᴇᴅ")
                }     
            }
        });
            ////////
            console.log("Connected to database!");
    }
    mm();
            //////////
            fs.readdirSync("./plugins").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() == ".js") {
                    require("./plugins/" + plugin);
                }
            });
            console.log("ᴘʟᴜɢɪɴs ʟᴏᴀᴅᴇᴅ");
            console.log("\n======[  ☞︎︎︎  ʟᴏɢs  ☜︎︎︎   ]======\n")
        }

        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode
            if (reason === DisconnectReason.badSession) {
                console.log(`Connection Error, Reconnect to web`);
                client.logout();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log("Connection closed, reconnecting....");
                Sparky();
            } else if (reason === DisconnectReason.connectionLost) {
                console.log("Connection Lost from web, reconnecting...");
                Sparky();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
                client.logout();
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(`Device Logged Out, Please Scan Again And Run.`);
                client.logout();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log("Restart Required, Restarting...");
                Sparky();
            } else if (reason === DisconnectReason.timedOut) {
                console.log("Connection TimedOut, Reconnecting...");
                Sparky();
            } else client.end(`Unknown DisconnectReason: ${reason}|${connection}`)
        }

    })


    /////////////////////////////////////////////

    client.ev.on("creds.update",
        saveCreds);

    /////////////////////////////////////////////

    
/*
    client.ev.on("contacts.update",
        (update) => {
            for (let contact of update) {
                let id = jidNormalizedUser(contact.id)
                if (store && store.contacts) store.contacts[id] = {
                    ...(store.contacts?.[id] || {}),
                    ...(contact || {})
                }
            }
        })
*/
    /////////////////////////////////////////////
/*
    client.ev.on("contacts.upsert",
        (update) => {
            for (let contact of update) {
                let id = jidNormalizedUser(contact.id)
                if (store && store.contacts) store.contacts[id] = {
                    ...(contact || {}),
                    isContact: true
                }
            }
        })
*/
    /////////////////////////////////////////////

    client.ev.on('messages.upsert',
        async (message) => {
            await MsgHandler(client, message)
        })

    /////////////////////////////////////////////

}

setTimeout(() => {
    web("ᴄᴏɴɴᴇᴄᴛᴇᴅ ✅")
    Sparky();
        }, 5000);

process.on('uncaughtException', function (err) {
    let e = String(err)
    if (e.includes("Socket connection timeout")) return
    if (e.includes("item-not-found")) return
    if (e.includes("rate-overlimit")) return
    if (e.includes("Connection Closed")) return
    if (e.includes("Timed Out")) return
    if (e.includes("Value not found")) return
    console.log('Caught exception: ', err)
})
