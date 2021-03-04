'use strict';

const Player = require('@player/player');
const {Command} = require('eustache-discord-framework');

/** Empties the queue */
class EmptyQueueCommand extends Command {
  /**
   * @param {EustacheClient} client
   */
  constructor(client) {
    super(client, {
      name: 'empty',
      alias: ['delete', 'reset', 'poubelle'],
      description: 'vide la liste de lecture.',
    });
  }

  /**
   * Runs the command
   * @param {discord.Message} msg
   */
  run(msg) {
    const player = Player.instance(this.client);
    player.emptyQueue(msg);
  }
}

module.exports = EmptyQueueCommand;
