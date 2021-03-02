'use strict';

require('module-alias/register');

const { EustacheClient } = require('eustache-discord-framework');
const { setUsername } = require('./util.js');
const config = require('./config.json');

const client = new EustacheClient({
    commandPrefix: config.bot.prefix,
    ownerID: config.bot.owner
});

client.on('typeRegister', type => console.log(`[BOT => REGISTRY] Registered command ${type.constructor.name}:${type.name}`));
client.on('commandRegister', command => console.log(`[BOT => REGISTRY] Registered command ${command.constructor.name}:${command.name}`));
client.on('commandTrigger', (command, args, msg, client) => console.log(`[BOT => COMMAND] Triggered ${command.constructor.name}:${command.name}.`));
client.on('unknownCommand', msg => console.log(`[BOT => COMMAND] Unknown command.`));
client.on('fetched', (track, query, from) => console.log(`[PLAYER => ${from.toUpperCase()}] Fetched ${track.name} from ${query}`));

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
