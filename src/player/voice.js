'use strict';

const { VoiceConnection } = require("discord.js");
const { Readable } = require('stream');

class Voice {
    /**
     * Connect the bot to voice
     * @param {VoiceChannel} channel
     * @returns {Promise<VoiceConnection>}
     */
    join(channel) {
        return new Promise((resolve, reject) => {
            return (channel || channel.type === 'voice') ? resolve(channel.join()) : reject();
        });
    }

    /**
     * Disconnect the bot from voice
     * @param {VoiceChannel} channel
     * @returns {void}
     */
    leave(channel) {
        return new Promise((resolve, reject) => {
            return (channel || channel.type === 'voice') ? resolve(channel.leave()) : reject(new Error(`Could not disconnect from voice.`));
        });
    }

    /**
     * Stream a media into a voice channel
     * @param {VoiceConnection} connection
     * @param {Readable} stream
     */
    play(connection, stream) {
        return new Promise((resolve, reject) => {
            if (typeof connection != 'object' || !connection.voice || (connection.channel.type ?? null) != 'voice') reject();
            if (!(stream instanceof Readable)) reject();
            const params = {
                type: 'opus',
                volume: false,
                bitrate: 'auto'
            }
            resolve(connection.play(stream, params));
        })
    }

    /** Pause the stream */
    pause(dispatcher) {
        dispatcher.pause(true);
    }

    /** Resume the stream */
    resume(dispatcher) {
        dispatcher.resume();
    }
}

module.exports = Voice;
