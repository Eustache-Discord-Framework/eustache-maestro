'use strict';

const api = require('./YouTubeDataAPI');
const Track = require('../track');

const regex = {
  url: RegExp(/(https:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/, 'ig'),
  video: new RegExp(/v=[\w\d_-]+/, 'ig'),
  playlist: new RegExp(/list=[\w\d_-]+/, 'ig')
}

const makeVideoUrl = id => `https://youtu.be/${id}`;

/**
 * Search for a video in YouTube - 100 api quota units
 * @param {string} query The search string
 * @returns {Promise<Track, Error>}
 */
function search(str) {
  return new Promise((resolve, reject) => {
    api.searchVideo(str)
      .then(items => {
        resolve(new Track(
          items[0].snippet.title,
          makeVideoUrl(items[0].id.videoId)
        ));
      })
      .catch(reject);
  });
}

/**
 * Fetch a youtube video or playlist videos - 1 api quota unit
 * @param {String} query The query string (containing an url)
 * @returns {Promise<Track|Track[], Error} The returned Tracks
 */
function query(query) {
  return new Promise((resolve, reject) => {
    if (!query.match(regex.url)) {
      throw new Error('Query must contain a YouTube url.');
    }
    const url = regex.url.exec(query)[0];
    let _query;
    if (url.match(regex.playlist)) {
      _query = playlistVideos
    } else if (url.match(regex.video)) {
      _query = video
    }
    _query(url)
      .then(resolve)
      .catch(reject);
  });
}

/**
 * Fetch items from a playlist - 1 api quota unit
 * @param {string} url The query url
 * @returns {Promise<Track, Error>}
 */
function video(url) {
  return new Promise((resolve, reject) => {
    const param = regex.video.exec(url)[0]
    const id = param.replace(/v=/, '');
    api.queryVideo(id)
      .then(items => {
        resolve(new Track(
          items[0].snippet.title,
          makeVideoUrl(items[0].id)
        ));
      })
      .catch(reject);
  });
}

/**
 * Fetch items from a playlist - 1 api quota unit
 * @param {string} url The query url
 * @returns {Promise<Track[], Error>}
 */
function playlistVideos(url) {
  return new Promise((resolve, reject) => {
    const param = regex.playlist.exec(url)[0];
    const id = param.replace(/list=/, '');
    api.queryPlaylistVideos(id)
      .then(items => {
        resolve(items.map((item) => {
          return new Track(
            item.snippet.title,
            makeVideoUrl(item.snippet.resourceId.videoId)
          );
        }));
      })
      .catch(reject);
  });
}

module.exports = {
  regex,
  search,
  query
};
