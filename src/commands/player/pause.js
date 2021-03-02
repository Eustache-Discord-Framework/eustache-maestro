'use strict';

const Player = require("@player/player");
const { Command } = require('eustache-discord-framework');

class PauseCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'pause',
            alias: ['restart', 'pouce'],
            description: "arrête la lecture."
        })
    }

    run(msg) {
        const player = Player.instance(this.client);
        return player.pause(msg)
    }
}

module.exports = PauseCommand;
