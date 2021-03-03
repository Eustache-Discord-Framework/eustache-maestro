'use strict';

const youtube = require('./YouTube/YouTubeService');

/** Creates the right track from the right service */
class ServiceDispatcher {
    constructor(client, player) {
        if (!client) throw new Error(`Missing client`);
        if (!player) throw new Error(`Missing player`);

        /**
         * The client of this player
         * @name PlayerDispatcher#client
         * @type {EustacheClient}
         */
        Object.defineProperty(this, 'client', { value: client });

        /**
         * The player to dispatch services
         * @name PlayerDispatcher#player
         * @type {Player}
         */
        Object.defineProperty(this, 'player', { value: player });
    }

    /**
     * Handle the player query
     * @param {*} msg
     * @param {*} query
     */
    async handleQuery(msg, query) {
        let track, tracks;
        if (query.match(youtube.url)) {
            const url = youtube.url.exec(query)[0];

            if (query.match(youtube.playlist)) {        //  Playlist
                tracks = await youtube.fetchPlaylistVideos(url);
                this.player.addToQueue(msg, tracks);
            } else if (query.match(youtube.video)) {    //  Video
                track = await youtube.fetchVideo(url);
                this.player.addToQueue(msg, track);
            }

        } else {
            track = await youtube.searchVideo(query);
            this.player.addToQueue(msg, track);
        }
    }
}

module.exports = ServiceDispatcher;
