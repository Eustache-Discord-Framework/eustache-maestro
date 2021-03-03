'use strict';

const Player = require("@player/player");
const { Command } = require('eustache-discord-framework');

class PlayCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'play',
            alias: ['connect', 'join', 'add'],
            description: "ajoute une piste à la liste de lecture.",
            args: [
                {
                    key: 'query',
                    label: 'URL | Recherche',
                    type: 'string',
                    infinite: true
                }
            ]
        })
    }

    run(msg, args) {
        const query = 'query' in args ? args.query : null;
        return Player.instance(this.client).play(msg, msg.member.voice.channel, query)
    }
}

module.exports = PlayCommand;
