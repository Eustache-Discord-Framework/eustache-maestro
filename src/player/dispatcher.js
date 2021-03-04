'use strict';

const youtube = require('./YouTube/YouTubeService');

/** Dispatches queries through available apis */
class ServiceDispatcher {
  /**
   * @param {EustacheClient} client
   * @param {Player} player
   */
  constructor(client, player) {
    if (!player) throw new Error('A player must be provided');

    /**
     * The player to dispatch services
     * @name PlayerDispatcher#player
     * @type {Player}
     */
    Object.defineProperty(this, 'player', {value: player});
  }

  /**
   * Handle the player query
   * @param {discord.Message} msg
   * @param {String} query
   */
  async handleQuery(msg, query) {
    let track; let tracks;
    if (query.match(youtube.url())) {
      const url = youtube.url().exec(query)[0];

      if (query.match(youtube.playlist)) { //  Playlist
        tracks = await youtube.fetchPlaylistVideos(url);
        this.player.addToQueue(msg, tracks);
      } else if (query.match(youtube.video)) { //  Video
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
