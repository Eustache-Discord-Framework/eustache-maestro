'use strict';

function escapeRegex(regex) {
    return regex.replace(`\\`, `\\\\`);
}

const { ArgumentType } = require('eustache-discord-framework');
const url = new RegExp(/(https\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/, 'ig');
const video = new RegExp(/v\=\w+/, 'ig');
const playlist = new RegExp(/list\=\w+/, 'ig');

/** Represent string type */
class YouTubeQueryArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'yt-query');
    }

    validate(value) {
        return this.client.registry.types.get('string').validate(value)
    }

    parse(msg, value) {
        let query = new Object();
        query.service = 'youtube';

        if (value.match(url)) {
            if (value.match(playlist)) {
                query.type = 'playlist';
                query.media = playlist.exec(value)[0].replace(/list\=/, '');
            }
            if (value.match(video)) {
                query.type = 'video';
                query.media = video.exec(value)[0].replace(/v\=/, '');
            }
        } else {
            query.type = 'video';
                query.media = String(value);
        }

        return query;
    }
}

module.exports = YouTubeQueryArgumentType;
