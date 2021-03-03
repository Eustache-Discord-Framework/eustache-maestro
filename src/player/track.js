'use strict';

const ytdl = require('ytdl-core-discord');

/** Represent a track */
class Track {
    /**
     * @typedef {Object} TrackData
     * @property {string} title The title of the track
     * @property {string} url The url of the track
     * @property {TrackAuthor} author The author infos of the track
     */
    /**
     * @param {TrackData} data
     */
    constructor(data) {
        /**
         * This media title
         * @type {string}
         */
        this.title = data.title;

        /**
         * This media url
         * @type {string}
         */
        this.url = data.url;

        /**
         * @typedef {Object} TrackAuthor
         * @property {string} name The author name
         * @property {url} url This author page url
         */
        /**
         * @type {TrackAuthor}
         */
        this.author = data.author
            ? {
                name: data.author.name ?? null,
                url: data.author.url ?? null
            }
            : null;
    }

    /**
     * Get a readable stream from ressource url
     * @returns {StreamReadable}
     */
    async getStream() {
        return await ytdl(this.url) ?? null;
    }
}

module.exports = Track;
