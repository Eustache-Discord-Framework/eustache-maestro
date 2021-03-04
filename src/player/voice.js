'use strict';

const {Readable} = require('stream');

/**
 * Interacts with discord voice channels
 */
class Voice {
  /**
   * Connects the bot to voice
   * @param {discord.VoiceChannel} channel
   * @return {Promise<discord.VoiceConnection, Error>}
   */
  join(channel) {
    return new Promise((resolve, reject) => {
      if (!channel || channel.type !== 'voice') {
        reject(new Error('Could not connect to the specified channel.'));
      } else {
        resolve(channel.join());
      }
    });
  }

  /**
   * Disconnects the bot from voice
   * @param {discord.VoiceChannel} channel
   * @return {Promise<void, Error>}
   */
  leave(channel) {
    return new Promise((resolve, reject) => {
      if (!channel || channel.type !== 'voice') {
        reject(new Error('Could not disconnect from voice.'));
      } else {
        resolve(channel.leave());
      }
    });
  }

  /**
   * Stream a media into a voice channel
   * @param {discord.VoiceConnection} connection
   * @param {stream.Readable} stream
   * @return {Promise<discord.VoiceConnection, Error>}
   */
  play(connection, stream) {
    return new Promise((resolve, reject) => {
      if (typeof connection != 'object' || !connection.voice) {
        reject(new Error('Incorrect voice connection provided.'));
      }
      if (!(stream instanceof Readable)) {
        reject(new Error('Stream must be an instance of stream.Readable'));
      }
      const params = {
        type: 'opus',
        volume: false,
        bitrate: 'auto',
      };
      resolve(connection.play(stream, params));
    });
  }

  /**
   * Pauses the stream
   * @param {discord.StreamDispatcher} dispatcher
   */
  pause(dispatcher) {
    dispatcher.pause(true);
  }

  /**
   * Resumes the stream
   * @param {discord.StreamDispatcher} dispatcher
   */
  resume(dispatcher) {
    dispatcher.resume();
  }
}

module.exports = Voice;
