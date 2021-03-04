'use strict';


const { embed } = require('@root/util');

/** Represent the music queue */
class Queue {
    /**
     * The played track
     * @type {Track}
     */
    currentTrack;

    constructor(client, player) {
        if (!client) throw new Error(`Missing client`);
        if (!player) throw new Error(`Missing player`);

        /**
         * The client of this player
         * @name PlayerDispatcher#client
         * @type {EustacheClient}
         */
        Object.defineProperty(this, 'client', { value: client });

        /**
         * The player to dispatch services
         * @name PlayerDispatcher#player
         * @type {Player}
         */
        Object.defineProperty(this, 'player', { value: player });

        this.queue = new Array();
    }

    /** Add a track to the queue */
    add(track) {
        return this.queue.push(track);
    }

    /** Return next track */
    next() {
        this.currentTrack = this.queue.shift();
        return this.currentTrack;
    }

    /** Shuffle this queue - Fisher–Yates shuffle algorithm */
    shuffle() {
        for (let i = this.queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
        }
        return this.queue;
    }

    /** Empty the queue */
    empty() {
        this.currentTrack = null;
        return this.queue.splice(0, this.queue.length);
    }

    async display(msg, maxTracks = 12) {
        // Delete the old message
        if (this.message && this.message.deletable) this.message.delete();

        let queueEmbed;
        if (this.queue.length === 0 && !this.currentTrack) {
            queueEmbed = embed()
                .setTitle('Player - Liste de lecture')
                .setDescription('La liste de lecture est vide.');
        } else {
            queueEmbed = embed()
                .setTitle('Player - Liste de lecture')
                .addField('En ce moment', `\`${this.currentTrack.title}\``)

            if (this.queue.length > 0) {
                let queue = '';
                const count = (this.queue.length > maxTracks) ? maxTracks : this.queue.length;
                for (let i = 0; i < count; i++) {
                    queue += `\`${i + 1}.\` \`${this.queue[i].title}\`\n`;
                }
                queueEmbed.addField(`${count > 1 ? 'Les' : 'Le'} ${count > 1 ? count : ''} titre${count > 1 ? 's' : ''} à venir`, queue);
            }
        }

        // Send the new message
        this.message = await msg.channel.send(queueEmbed).catch(console.error);
    }

}

module.exports = Queue;
