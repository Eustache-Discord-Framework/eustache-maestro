'use strict';

require('module-alias/register');

const {EustacheClient} = require('eustache-discord-framework');
const {setUsername} = require('./util.js');
const config = require('@config/bot-config.json');

const client = new EustacheClient({
  commandPrefix: config.bot.prefix,
  ownerID: config.bot.owner,
});

client.registry
    .registerDefaults()
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
      require('@commands/queue/shuffle'),
    ]);

client.on('ready', () => {
  // This part is not in the client file cuz it requires the config
  const bot = client.user;

  if (bot.username != config.bot.username) {
    setUsername(bot, config.bot.username);
  }

  console.log(`[LOGGED IN] ${bot.tag} <${bot.id}>`);
  console.log('[READY] Wating for messages...');
});

client.login(config.bot.token);
