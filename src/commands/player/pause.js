'use strict';

const Player = require('@player/player');
const {Command} = require('eustache-discord-framework');

/** Pauses the current media */
class PauseCommand extends Command {
  /**
   * @param {EustacheClient} client
   */
  constructor(client) {
    super(client, {
      name: 'pause',
      alias: ['restart', 'pouce'],
      description: 'arrête la lecture.',
    });
  }

  /**
   * Runs the command
   * @param {discord.Message} msg
   */
  run(msg) {
    const player = Player.instance(this.client);
    player.pause(msg);
  }
}

module.exports = PauseCommand;
