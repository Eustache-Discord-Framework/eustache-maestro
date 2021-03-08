'use strict';

const ytdl = require('ytdl-core-discord');

/** Represent an audio track */
class Track {
  /**
  * @typedef {Object} TrackData
  * @property {string} title The title of the track
  * @property {string} url The link to the ressource
  * @property {Object} author The author infos of the track
  * @property {string} author.name The name of the author
  * @property {string} author.url The link to the author's page
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
    this.author = data.author ?
      {
        name: data.author.name ?? null,
        url: data.author.url ?? null,
      } :
      null;
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
