'use strict';

const ytdl = require('ytdl-core-discord');

/** Represent an audio track */
class Track {
  /**
  * @param {string} title The title of the track
  * @param {string} url The link to the ressource
  */
  constructor(title, url) {
    /**
     * This media title
     * @type {string}
     */
    this.title = title;

    /**
     * This media url
     * @type {string}
     */
    this.url = url;
  }

  /**
  * Get a readable stream from ressource url
  * @type {stream.Readable}
  */
  get stream() {
    return ytdl(this.url).catch(console.error) ?? null;
  }
}

module.exports = Track;
