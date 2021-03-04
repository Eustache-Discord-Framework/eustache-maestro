'use strict';

const Player = require('@player/player');
const {Command} = require('eustache-discord-framework');

/** Skips the current media */
class NextCommand extends Command {
  /**
   * @param {EustacheClient} client
   */
  constructor(client) {
    super(client, {
      name: 'next',
      alias: ['skip', 'passe'],
      description: 'passe la piste en cours de lecture.',
    });
  }

  /**
   * Runs the command
   * @param {discord.Message} msg
   */
  run(msg) {
    const player = Player.instance(this.client);
    player.next(msg);
  }
}

module.exports = NextCommand;
