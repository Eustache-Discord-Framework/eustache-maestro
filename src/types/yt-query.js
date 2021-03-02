'use strict';

const { ArgumentType } = require('eustache-discord-framework');
const youtubeUrl = new RegExp('^https?\\:\\/\\/(www\\.)?(youtube\\.com|youtu\\.?be)\/[\\?\\=\\w]+');

/** Represent string type */
class YouTubeQueryArgumentType extends ArgumentType {
    constructor(client) {
        super(client, 'yt-query');
    }

    validate(value) {
        return (super.validate(value, youtubeUrl) || this.client.registry.types.get('string').validate('value'))
    }

    parse(msg, value) {
        // Returns embeds to save some YouTube API points
        if (value.match(youtubeUrl)) return msg.embeds[0]
        else return String(value);
    }
}

module.exports = YouTubeQueryArgumentType;
