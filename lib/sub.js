const acrcloud = require('acrcloud');
const acr = new acrcloud({
  host: 'identify-ap-southeast-1.acrcloud.com',
  access_key: 'd61b3dcb8c5a66576cd088db0a6ff8f0',
  access_secret: '6B6Rfv75VOX72SQhEZWaDDxn5IsxKWQvpNSggoA7'
});
const Jimp = require("jimp");


async function MusicFind(m, client){
let buff = await m.quoted.download()
            let result = await acr.identify(buff);
            let {
                title,
                artists,
                album,
                genres,
                release_date,
                duration_ms,
                external_metadata
            } = result.metadata.music[0]
            return await m.reply(`_Title : ${title}_\n${album.name ? `_Album : ${album.name}_\n`: ''}${artists[0]?.name ? `_Artists : ${artists[0]?.name.split('/').join(', ')}_\n`: ''}${genres ? `_Genre : ${genres?.map(genre => genre?.name).join(', ')}_\n`: ''}${duration_ms ? `_Duration : ${duration_ms / 1000 + 's'}_\n`: ''}${release_date ? `_Release Date : ${release_date}_\n`: ''}${external_metadata.spotify ? `_Spotify : https://open.spotify.com/track/${external_metadata.spotify?.track.id}_\n`: ''}${external_metadata.youtube ? `_Youtube : https://youtu.be/${external_metadata.youtube.vid}_\n`: ''}`)
}

////////
async function updatefullpp(jid, imag, client) {
    const {
        query
    } = client;
    const {
        img
    } = await generateProfilePicture(imag);
    await query({
        tag: "iq",
        attrs: {
            to: jid,
            type: "set",
            xmlns: "w:profile:picture",
        },
        content: [{
            tag: "picture",
            attrs: {
                type: "image"
            },
            content: img,
        },
        ],
    });
}

async function generateProfilePicture(buffer) {
    const jimp = await Jimp.read(buffer);
    const min = jimp.getWidth();
    const max = jimp.getHeight();
    const cropped = jimp.crop(0,
        0,
        min,
        max);
    return {
        img: await cropped.scaleToFit(324,
            720).getBufferAsync(Jimp.MIME_JPEG),
        preview: await cropped.normalize().getBufferAsync(Jimp.MIME_JPEG),
    };
}
//////

module.exports = {
MusicFind,
updatefullpp
}