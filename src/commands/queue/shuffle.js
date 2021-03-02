'use strict';

const Player = require("@player/player");
const { Command } = require('eustache-discord-framework');

class ShuffleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'shuffle',
            alias: ['random', 'mix', 'sens-dessus-dessous'],
            description: "mélange la liste de lecture."
        })
    }

    run(msg) {
        const player = Player.instance(this.client);
        return player.shuffleQueue(msg);
    }
}

module.exports = ShuffleCommand;
