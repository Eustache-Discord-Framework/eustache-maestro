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
            const url = youtube.url.exec(query);

            // Playlist
            if (query.match(youtube.playlist)) {
                tracks = await youtube.fetchPlaylistVideos(url);
                console.log(tracks.map(tr => tr.title));
            }
            // Video
            if (query.match(youtube.video)) {
                track = await youtube.fetchVideo(url);
                console.log(track.title)
            }

        } else {
            track = await youtube.searchVideo(query);
            console.log(track.title)
        }
    }
}

module.exports = ServiceDispatcher;
