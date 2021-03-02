'use strict';

const Player = require("@player/player");
const { Command } = require('eustache-discord-framework');

class QueueCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'queue',
            alias: ['playlist', 'list'],
            description: "affiche la liste de lecture."
        })
    }

    run(msg) {
        const player = Player.instance(this.client);
        return player.displayQueue(msg);
    }
}

module.exports = QueueCommand;
