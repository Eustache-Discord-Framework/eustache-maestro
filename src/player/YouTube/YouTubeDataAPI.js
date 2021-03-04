'use strict'

const { google } = require('googleapis');
const config = require('@config/bot-config.json');

const youtube = google.youtube({
    version: 'v3',
    auth: config.google.youtube_data.api_key
});

/**
* Return a list of data from any YouTube Data API Ressource
* @param {*} ressource
* @param {Object} params
* @returns {Promise<Object>}
*/
async function fetchDataFromRessource(ressource, params) {
    return new Promise((resolve, reject) => {
        ressource.list(params)
            .then(response => {
                const items = response.data.items ?? null;
                if (!items) reject();
                else resolve(items);
            })
            .catch(reject);
    });
}


module.exports = {

    /**
     * Search a video from a search string
     * @param {String} query The search string
     * @param {Number} maxResults The maximum results from the response (1-50)
     * @returns {Promise<Object>} The fetched video data
     */
    queryVideoByString: query => {
        const params = {
            part: 'snippet',
            maxResults: 1,
            q: query,
            regionCode: 'FR',
            type: 'video'
        };
        return fetchDataFromRessource(youtube.search, params);
    },

    /**
     * Fetch a video from a video id
     * @param {String} id The video id
     * @param {Number} maxResults The maximum results from the response (1-50)
     * @returns {Promise<Object>} The fetched video data
     */
    queryVideoByVideoId: id => {
        const params = {
            part: 'snippet',
            id: id,
            maxResults: 1
        };
        return fetchDataFromRessource(youtube.videos, params);
    },

    /**
     * Fetch playlist items from a playlist id
     * @param {String} id The playlist id
     * @param {Number} maxResults The maximum results from the response (1-50)
     * @returns {Promise<Object>} The playlist items
     */
    queryPlaylistItemsByPlaylistId: id => {
        const params = {
            part: 'snippet',
            playlistId: id,
            maxResults: 50
        };
        return fetchDataFromRessource(youtube.playlistItems, params);
    }
}
