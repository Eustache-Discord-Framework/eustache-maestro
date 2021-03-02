'use strict'

const { google } = require('googleapis');
const config = require('@src/config.json');

const youtube = google.youtube({
    version: 'v3',
    auth: config.google.youtube_data.api_key
});

/** Interacts with the YouTube Data API */
class YouTubeDataAPI {
    /**
     * Return a list of data from any YouTube Data API Ressource
     * @param {*} ressource
     * @param {Object} params
     * @returns {Promise<?Object|string>}
     */
    static async #fetchData(ressource, params) {
        return new Promise(async (resolve, reject) => {
            ressource.list(params, (error, response) => {
                if (error) reject(error)
                if (response) resolve(response.data.items)
            });
        })
    }

    /**
     * Fetch a YouTube video from a query string
     * @param {string} query
     * @param {int} maxResults
     * @returns {Promise<?Object|string>}
     */
    static async fetchVideoFromSearch(query, maxResults = 1) {
        return this.#fetchData(youtube.search, {
            part: 'snippet',
            maxResults: maxResults,
            q: query,
            regionCode: 'FR',
            type: 'video',
        })
    }
}

module.exports = YouTubeDataAPI;
