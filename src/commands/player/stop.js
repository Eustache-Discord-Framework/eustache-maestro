'use strict';

const Player = require('@player/player');
const {Command} = require('eustache-discord-framework');

/** Stops the player */
class StopCommand extends Command {
  /**
   * @param {EustacheClient} client
   */
  constructor(client) {
    super(client, {
      name: 'stop',
      alias: ['disconnect', 'leave'],
      description: 'vide la liste de lecture et arrête le lecteur.',
    });
  }

  /**
   * Runs the command
   * @param {discord.Message} msg
   */
  run(msg) {
    const player = Player.instance(this.client);
    player.stop(msg);
  }
}

module.exports = StopCommand;
