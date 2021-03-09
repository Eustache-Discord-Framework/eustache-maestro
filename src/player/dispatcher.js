'use strict';

const youtube = require('./YouTube/YouTubeService');

/** Dispatches queries through available apis */
class ServiceDispatcher {
  /**
   * Handle the player query
   * @param {discord.Message} msg
   * @param {String} query
   * @returns {Promise<Boolean, Error>}
   */
  async handleQuery(query) {
    return new Promise((resolve, reject) => {
      // Query contains a YouTube url
      if (query.match(youtube.regex.url)) {
        youtube.query(query)
          .then(resolve)
          .catch(reject);
      // Query is just a normal search string
      } else {
        youtube.searchVideo(query)
          .then(resolve)
          .catch(reject);
      }
    });
  }
}

module.exports = ServiceDispatcher;
