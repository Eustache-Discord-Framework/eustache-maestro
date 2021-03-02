'use strict';

const Player = require("@player/player");
const { Command } = require('eustache-discord-framework');

class StopCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stop',
            alias: ['disconnect', 'leave'],
            description: "vide la liste de lecture et arrête le lecteur."
        })
    }

    run(msg) {
        const player = Player.instance(this.client);
        return player.stop(msg);
    }
}

module.exports = StopCommand;
