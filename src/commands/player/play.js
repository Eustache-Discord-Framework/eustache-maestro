'use strict';

const Player = require('@player/player');
const {Command} = require('eustache-discord-framework');

/** Plays or pushes to queue any media */
class PlayCommand extends Command {
  /**
   * @param {EustacheClient} client
   */
  constructor(client) {
    super(client, {
      name: 'play',
      alias: ['connect', 'join', 'add', 'youtube', 'yt'],
      description: 'ajoute une piste à la liste de lecture.',
      args: [
        {
          key: 'query',
          label: 'URL | Recherche',
          type: 'string',
          infinite: true,
        },
      ],
    });
  }

  /**
   * Runs the command
   * @param {discord.Message} msg
   * @param {Object} args
   */
  run(msg, args) {
    const query = 'query' in args ? args.query : null;
    const player = Player.instance(this.client);
    player.play(msg, msg.member.voice.channel, query);
  }
}

module.exports = PlayCommand;
