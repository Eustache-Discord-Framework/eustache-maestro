'use strict';

require('module-alias/register');

const config = require('@config/bot-config.json');
const discord = require('discord.js');

/**
 * Set the username of a user
 * @param {ClientUser} user The user you want to update the username
 * @param {string} username The new value
*/
function setUsername(user, username) {
  if (typeof username != 'string') throw Error('Username must be a string.');
  user.setUsername(username)
      .then((user) => console.log(`Updated username to ${user.username}.`))
      .catch(console.error);
}

const player = {
  OFF: 0,
  PLAYING: 1,
  PAUSED: 10,
};

/**
 * Returns an embed with Eustache's template
 * @return {discord.MessageEmbed}
 */
const baseEmbed = () => new discord.MessageEmbed({
  color: 'FFBD4A',
  files: [
    new discord.MessageAttachment('./src/avatar.png', 'avatar.png'),
  ],
  footer: {
    text: config.bot.username,
    iconURL: 'attachment://avatar.png',
  },
  timestamp: Date.now(),
});

module.exports = {
  setUsername,
  player,
  baseEmbed,
};
