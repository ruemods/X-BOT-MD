const { SUDO, HANDLERS, WORK_TYPE, ALWAYS_ONLINE, AUTO_STATUS_VIEW, DISABLE_PM, READ_MESSAGES, PM_BLOCK, PMB } = require('../config.js');
const { serialize } = require('./serialize.js');
const { commands } = require('./plugins.js');
const Spinnies = require("spinnies")
const spinnies = new Spinnies({
    spinner: {
        interval: 200, frames: ["", "_"],
    }
})

  module.exports = MsgHandler = async ( client , message) => {
      spinnies.add("spinner-2", { text: " ", color: "cyan" })

  if (message.type !== "notify") return;
            let m = serialize(JSON.parse(JSON.stringify(message.messages[0])), client)
            let text = m.body
  console.log(`ᴀᴛ : ${m.jid}\nғʀᴏᴍ : ${m.pushName}\nᴍᴇssᴀɢᴇ : ${m.body || m.type}` );

  /*    
/////////////////////////////////////////////////////
      if (AUTO_STATUS_VIEW === "true") {
            if (m.key && m.key.remoteJid === 'status@broadcast'){
            client.readMessages([m.key]) 
                    }
                    }
//////////////////////
  if (PM_BLOCK === "true") {
    if (m.key.fromMe !== true && !SUDO.split(',').includes(m.key.remoteJid.split('@')[0])) {
      await client.sendMessage(m.key.remoteJid, {
        text: `${PMB}`
      });
      await client.updateBlockStatus(m.key.remoteJid, "block");
    }
  }
/////////////////
      
if (READ_MESSAGES  === "true") {
          await client.readMessages([m.key]);
      }
/////////////////////////      
     */       
        commands.map(async (Sparky) => {
//var whitelistedIds = ["917012984396", "919656459062", "917594898804"];
if (Sparky.fromMe && !( SUDO.split(",").includes(m.sender.split("@")[0]) || m.isSelf )) {
return;
     }
                let comman = m.text
                ? m.body[0].toLowerCase() + m.body.slice(1).trim(): "";

         /* if (HANDLERS === '^') return m.prefix = "noprefix"
          else m.prefix = new RegExp(HANDLERS).test(comman) ? comman[0].toLowerCase(): ",";
*/
                let args;

                switch (true) {
                    
                    case Sparky.name && Sparky.name.test(comman):
                      //args = m.body.replace(new RegExp(Sparky.name, "i"), "").trim();
                      args = m.body.replace(Sparky.name, '$1').trim();
                        Sparky.function({
                            m, args, client 
                        });
                        break;

                    case m.body && Sparky.on === "text":
                        args = m.body
                        Sparky.function({
                            m, args, client
                        });
                        break;
                    case Sparky.on === "image" || Sparky.on === "photo":
                        if (m.type === "imageMessage") {
                            Sparky.function({
                                m, client 
                            });

                        }
                        break;

                    case Sparky.on === "sticker":
                        if (m.type === "stickerMessage") {
                            Sparky.function({
                                m, client
                            });
                        }
                        break;
                    case Sparky.on === "video":
                        if (m.type === "videoMessage") {
                            Sparky.function({
                                m, client 
                            });
                        }
                        break;

                    default:
                        break;
                }

            })
///////////////////////////////////////////////////////////////

}
