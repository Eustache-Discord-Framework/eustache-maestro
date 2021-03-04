'use strict';

const Player = require('@player/player');
const {Command} = require('eustache-discord-framework');

/** Shuffles the queue */
class ShuffleCommand extends Command {
  /**
   * @param {EustacheClient} client
   */
  constructor(client) {
    super(client, {
      name: 'shuffle',
      alias: ['random', 'mix', 'sens-dessus-dessous'],
      description: 'mélange la liste de lecture.',
    });
  }

  /**
   * Runs the command
   * @param {discord.Message} msg
   */
  run(msg) {
    const player = Player.instance(this.client);
    player.shuffleQueue(msg);
  }
}

module.exports = ShuffleCommand;
