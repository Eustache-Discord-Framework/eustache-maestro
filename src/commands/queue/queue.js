'use strict';

const Player = require('@player/player');
const {Command} = require('eustache-discord-framework');

/** Displays the queue */
class QueueCommand extends Command {
  /**
   * @param {EustacheClient} client
   */
  constructor(client) {
    super(client, {
      name: 'queue',
      alias: ['playlist', 'list'],
      description: 'affiche la liste de lecture.',
    });
  }

  /**
   * Runs the command
   * @param {discord.Message} msg
   */
  run(msg) {
    const player = Player.instance(this.client);
    player.displayQueue(msg);
  }
}

module.exports = QueueCommand;
