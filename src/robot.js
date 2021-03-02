'use strict';

require('module-alias/register');

const { EustacheClient } = require('eustache-discord-framework');
const { setUsername } = require('./util.js');
const config = require('./config.json');

const client = new EustacheClient({
    prefix: config.bot.prefix,
    ownerID: config.bot.owner
});

client.registry
    .registerDefaults()
    .registerTypes([
        require('@types/yt-query')
    ])
    .registerCommands([
        // Player
        require('@commands/player/play'),
        require('@commands/player/stop'),
        require('@commands/player/pause'),
        require('@commands/player/resume'),
        require('@commands/player/next'),
        // Queue
        require('@commands/queue/queue'),
        require('@commands/queue/empty'),
        require('@commands/queue/shuffle')
    ]);

client.on('ready', () => {
    // This part is not in the client file cuz it requires the config
    const bot = client.user;
    console.log(`Logged in as ${bot.tag} !`);
    if (bot.username != config.bot.username) setUsername(bot, config.bot.username);
    bot.setActivity('')
});

client.login(config.bot.token);
