'use strict';

const { player, embed } = require('../util');
const Queue = require("./queue");
const Voice = require('./voice');
const ServiceDispatcher = require('./dispatcher')

/** Represent the music player */
class Player {
    /**
     * This instance
     * @static
     * @type {Player}
     */
    static $instance = null;

    /**
     * The current voice connection
     * @type {discord.VoiceConnection}
     */
    connection;

    /**
     * The current stream status
     * @type {stream.Readable}
     */
    status = player.OFF;

    /**
     * This streamDispatcher
     * @type {discord.StreamDispatcher}
     */
    streamDispatcher;

    /**
     * The played track
     * @type {Track}
     */
    currentTrack;

    /**
     * This player user interface message
     * @type {discord.Message}
     */
    ui;

    static instance(client) {
        if (this.$instance === null) {
            this.$instance = new this(client)
        }
        return this.$instance;
    }

    constructor(client) {
        Object.defineProperty(this, 'client', { value: client });

        /**
         * This voice connection
         */
        this.voice = new Voice(client)

        /**
         * This player queue
         * @type {Queue}
         */
        this.queue = new Queue();

        /**
         * This service dispatcher
         * @type {ServiceDispatcher}
         */
        this.serviceDispatcher = new ServiceDispatcher(this.client, this)
    }

    /**
     * Connect the bot to voice
     * @param {discord.Message} msg
     * @param {discord.VoiceChannel} channel
     * @returns {void}
     */
    async connect(msg, channel) {
        if (this.connection) return;
        const reply = await msg.channel.send(`Connection en cours...`);
        this.connection = await this.voice.join(channel)
            .then(connection => {
                reply.edit(`Connecté au salon \`#${connection.channel.name}\`.`);
                return connection;
            })
            .catch(() => reply.edit(`Connectez-vous à un salon vocal d'abord.`));
        if (this.connection) this.connection.on('disconnect', () => this.destroy())
    }

    /**
     * Disconnect the bot from voice
     * @param {discord.Message} msg
     * @returns {void}
     */
    async disconnect(msg) {
        if (!this.connection) return;
        const reply = await msg.channel.send(`Déconnection...`);
        this.voice.leave(this.connection.channel)
            .then(() => reply.edit(`Déconnecté.`))
            .catch(console.error);
    }

    /**
     * Destroy the voice connection
     * @returns {void}
     */
    destroy() {
        this.connection = null;
        this.status = player.OFF;
        this.streamDispatcher = null;
    }

    /**
     * Play a media or load it in the queue
     * @param {discord.Message} msg
     * @param {discord.VoiceChannel} channel
     * @param {string} query
     */
    async play(msg, channel, query) {
        if (!query) return
        await this.serviceDispatcher.handleQuery(msg, query)
        await this.connect(msg, channel);
        if (this.status !== player.PLAYING) this.next(msg);
        this.displayQueue(msg);
    }

    /**
     * Stream a media
     * @param {discord.Message} msg
     * @param {Track} track
     */
    async stream(msg, track) {
        const stream = await track.stream;
        if (!stream) return this.streamError(msg);
        stream.on('error', () => this.streamError(msg));
        stream.on('end', () => this.next(msg));

        this.streamDispatcher = await this.voice.play(this.connection, stream)
            .then(streamDispatcher => {
                this.status = player.PLAYING;
                return streamDispatcher;
            })
            .catch(console.error);
    }

    streamError(msg) {
        msg.channel.send(`Une erreur est survenue lors de la lecture de la piste.`);
        this.next(msg);
    }

    /**
     * Play next media in queue
     * @param {discord.Message} msg
     */
    async next(msg) {
        if (this.queue.length > 0) {
            this.currentTrack = this.queue.next();
            return this.stream(msg, this.currentTrack);
        };
        msg.channel.send(`la liste de lecture est vide.`);
        return this.disconnect(msg);
    }

    /**
     * Pause the player
     * @param {discord.Message} msg
     * @returns {discord.Message}
     */
    async pause(msg) {
        if (this.status === player.OFF) return msg.reply(`je ne joue pas de musique pour l'instant.`);
        if (this.status === player.PAUSED) return msg.reply(`le lecteur est déjà en pause.`);
        await this.voice.pause(this.streamDispatcher);
        this.status = player.PAUSED;
        return msg.reply(`le lecteur est été mis en pause.`);
    }

    /**
     * Resume the player
     * @param {discord.Message} msg
     * @returns {discord.Message}
     */
    async resume(msg) {
        if (this.status === player.OFF) return msg.reply(`je ne joue pas de musique pour l'instant.`);
        if (this.status === player.PLAYING) return msg.reply(`le lecteur est déjà en cours.`);
        await this.voice.resume(this.streamDispatcher);
        this.status = player.PLAYING;
        return msg.reply(`le lecteur a redémarré.`);
    }

    /**
     * Stop the player
     * @param {discord.Message} msg
     */
    async stop(msg) {
        this.emptyQueue(msg);
        if (this.status === player.PLAYING || this.status === player.PAUSED) this.disconnect(msg);
    }

    /**
     * Display the queue
     * @param {discord.Message} msg
     */
    async displayQueue(msg, maxTracks = 12) {
        // Delete the old message
        if (this.ui && this.ui.deletable) this.message.delete();

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
        this.ui = await msg.channel.send(queueEmbed).catch(console.error);
    }

    /**
     * Push track to the queue
     * @param {discord.Message} msg
     * @param {Track|Track[]} track
     */
    async addToQueue(msg, track) {
        if (!track) return msg.reply(`Aucun média n'a été trouvé`);
        if (Array.isArray(track)) {
            for (const tr of track) {
                this.queue.add(tr);
            }
            return msg.reply(`\`${track.length}\` média${track.length > 1 ? 's' : ''} ${track.length > 1 ? 'ont' : 'a'} été ajouté${track.length > 1 ? 's' : ''} à la liste de lecture.`);
        } else {
            this.queue.add(track);
            return msg.reply(`\`${track.title}\` a été ajouté à la liste de lecture.`);
        }
    }

    /**
     * Empty the queue
     * @param {discord.Message} msg
     */
    async emptyQueue(msg) {
        await this.queue.empty();
        return msg.reply(`la liste de lecture a été supprimée.`)
    }

    /**
     * Shuffle the queue
     * @param {discord.Message} msg
     */
    async shuffleQueue(msg) {
        await this.queue.shuffle()
        return msg.reply(`la liste de lecture a été mélangée.`)
    }
}

module.exports = Player;
