'use strict';

const api = require('./YouTubeDataAPI');
const Track = require('../track');

/**
 * YouTube API interactions are limited by a 10 000 units quota
 * Action cost depends on the action type, each method calling
 * the api is exported with his own cost in the jsdoc
 */

/**
 * YouTube url regex
 * @return {RegExp}
 */
const url = () => {
  const regex = /(https:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/gi;
  return new RegExp(regex);
};

/**
 * YouTube url video identifier
 * @type {RegExp}
 */
const video = new RegExp(/v=\w+/, 'ig');

/**
 * YouTube url playlist identifier
 * @type {RegExp}
 */
const playlist = new RegExp(/list=[\w-]+/, 'ig');

/**
 * Extracts a video id from an url
 * @param {String} url The url to parse
 * @return {String} The video id
 */
const extractVideoId = (url) => {
  return video.exec(url)[0].replace(/v=/, '');
};

/**
 * Extracts a playlist id from an url
 * @param {String} url The url to parse
 * @return {String} The playlist id
 */
const extractPlaylistId = (url) => {
  return playlist.exec(url)[0].replace(/list=/, '');
};

/**
 * Makes a video url from a video id
 * @param {String} id The video id
 * @return {String} The full video url
 */
const makeVideoUrl = (id) => `https://youtube.com/watch?v=${id}`;

/**
 * Makes a channel url from a channel id
 * @param {String} id The channel id
 * @return {String} The full channel url
 */
const makeChannelUrl = (id) => `https://youtube.com/channel/${id}`;

/**
 * Build a track from video data
 * @param {Object} data
 * @return {Track}
 */
function trackFromVideo(data) {
  return new Track({
    title: data.snippet.title,
    url: makeVideoUrl(data.id),
    author: {
      name: data.snippet.channelTitle,
      url: makeChannelUrl(data.snippet.channelId),
    },
  });
}

/**
 * Build a track from playlist item data
 * @param {Object} data
 * @return {Track}
 */
function trackFromPlaylistItem(data) {
  return new Track({
    title: data.snippet.title,
    url: makeVideoUrl(data.snippet.resourceId.videoId),
    author: {
      name: data.snippet.videoOwnerChannelTitle,
      url: makeChannelUrl(data.snippet.videoOwnerChannelId),
    },
  });
}

module.exports = {
  url,
  video,
  playlist,
  extractVideoId,
  extractPlaylistId,
  makeVideoUrl,
  makeChannelUrl,

  /**
   * Fetch items from a playlist - 100 api units
   * @param {string} query The query string
   * @return {Track}
   */
  searchVideo: async (query) => {
    const items = await api.getVideoBySearch(query);
    return trackFromVideo(items[0]);
  },

  /**
   * Fetch items from a playlist - 1 api unit
   * @param {string} url The query url
   * @return {Track}
   */
  fetchVideo: async (url) => {
    const id = extractVideoId(url);
    const items = await api.queryVideoByVideoId(id);
    return trackFromVideo(items[0]);
  },

  /**
   * Fetch items from a playlist - 1 api unit
   * @param {string} url The query url
   * @return {Track[]}
   */
  fetchPlaylistVideos: async (url) => {
    const id = extractPlaylistId(url);
    const items = await api.queryPlaylistItemsByPlaylistId(id);
    return items.map((item) => trackFromPlaylistItem(item));
  },
};
