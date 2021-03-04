'use strict';

const Player = require('@player/player');
const {Command} = require('eustache-discord-framework');

/** Resumes the player */
class ResumeCommand extends Command {
  /**
   * @param {EustacheClient} client
   */
  constructor(client) {
    super(client, {
      name: 'resume',
      alias: ['p', 'pluspouce'],
      description: 'reprends la lecture.',
    });
  }

  /**
   * Runs the command
   * @param {discord.Message} msg
   */
  run(msg) {
    const player = Player.instance(this.client);
    player.resume(msg);
  }
}

module.exports = ResumeCommand;
