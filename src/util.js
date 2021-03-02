'use strict';

/**
 * Set the username of a user
 * @param {ClientUser} user The user you want to update the username
 * @param {string} username The new value
*/
function setUsername(user, username) {
    if (typeof username != 'string') throw Error(`Username must be a string.`);
    user.setUsername(username)
        .then(user => console.log(`Updated username to ${user.username}.`))
        .catch(console.error);
}

const player = {
    OFF: 0,
    PLAYING: 1,
    PAUSED: 10
}

module.exports = {
    setUsername,
    player
}
