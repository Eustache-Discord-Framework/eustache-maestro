'use strict';

const Track = require("../base");

class EmbedTrack extends Track {
    constructor(data) {
        super({
            title: data.title ?? null,
            url: data.video.url ?? null,
            author: {
                name: data.author.name ?? null,
                url: data.author.url ?? null
            }
        });
    }
}

module.exports = EmbedTrack;
