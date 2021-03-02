'use strict';

const Player = require("@player/player");
const { Command } = require('eustache-discord-framework');

class EmptyQueueCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'empty',
            alias: ['delete', 'reset', 'poubelle'],
            description: "vide la liste de lecture."
        })
    }

    run(msg) {
        const player = Player.instance(this.client);
        return player.emptyQueue(msg);
    }
}

module.exports = EmptyQueueCommand;
