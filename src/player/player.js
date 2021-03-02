'use strict';

const { player } = require('../util');
const Queue = require("./queue");
const Voice = require('./voice');
const YouTube = require('./YouTube/YouTubeService');
const discord = require('discord.js');
const EmbedTrack = require('./Embed/EmbedTrack');

/** Represent the music player */
class Player {
    /**
     * This instance
     * @static
     * @type {ThisType<Player>}
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
    dispatcher;

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
    }

    /**
     * Connect the bot to voice
     * @param {discord.Message} msg
     * @param {discord.VoiceChannel} channel
     * @returns {void}
     */
    async connect(msg, channel) {
        if (this.connection) return;
        const reply = await msg.reply(`connection en cours...`);
        this.connection = await this.voice.join(channel)
            .then(connection => {
                reply.edit(`${msg.author}, connecté au salon \`#${connection.channel.name}\`.`);
                return connection;
            })
            .catch(() => reply.edit(`${msg.author}, connectez-vous à un salon vocal d'abord.`));
        if (this.connection) this.connection.on('disconnect', () => this.destroy())
    }

    /**
     * Disconnect the bot from voice
     * @param {discord.Message} msg
     * @returns {void}
     */
    async disconnect(msg) {
        if (!this.connection) return;
        const reply = await msg.channel.send(`déconnection...`);
        this.voice.leave(this.connection.channel)
            .then(() => reply.edit(`déconnecté.`))
            .catch(console.error);
    }

    /**
     * Destroy the voice connection
     * @returns {void}
     */
    destroy() {
        this.connection = null;
        this.status = player.OFF;
        this.dispatcher = null;
    }

    /**
     * Play a media or load it in the queue
     * @param {discord.Message} msg
     * @param {discord.VoiceChannel} channel
     * @param {string} query
     */
    async play(msg, channel, query) {
        if (!query) return
        const track = await this.askService(query);
        if (!track) return msg.reply(`cette ressource est introuvable.`)
        await this.connect(msg, channel);
        if (this.status === player.PLAYING) this.addToQueue(msg, track)
        else this.stream(msg, track);
    }

    /**
     * Stream a media
     * @param {discord.Message} msg
     * @param {?YouTubeTrack} track
     */
    async stream(msg, track) {
        const stream = await track.getStream();
        if (!stream) {
            msg.channel.send(`Une erreur est survenue lors de la lecture de la piste.`);
            return this.next(msg)
        }
        stream.on('error', () => {
            msg.channel.send(`Une erreur est survenue lors de la lecture de la piste.`)
            return this.next(msg);
        });
        stream.on('end', () => this.next(msg));
        this.dispatcher = await this.voice.play(this.connection, stream)
            .then(dispatcher => {
                this.status = player.PLAYING;
                msg.channel.send(`\`${track.title}\``);
                return dispatcher;
            })
            .catch(console.error);
    }

    /**
     * Play next media in queue
     * @param {discord.Message} msg
     */
    async next(msg) {
        if (this.queue.length > 0) return this.stream(msg, this.queue.next());
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
        await this.voice.pause(this.dispatcher);
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
        await this.voice.resume(this.dispatcher);
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
     * Vers un PlayerDispatcher !?
     */
    /**
     * Select the media provider service to use and if not necessary, directly returns the track
     * @param {*} query
     */
    async askService(query) {
        let track, service;
        if (query instanceof discord.MessageEmbed && query.provider.name === 'YouTube') {
            service = 'EMBED';
            track = new EmbedTrack(await query);
        }
        else if (typeof query === 'string') {
            service = 'YOUTUBE';
            track = await YouTube.video(query);
        }
        /**
         * @event EustacheClient#fetched
         * @param {YouTubeTrack} track The fetched track
         * @param {string} query The youtube video query
         * @param {string} service The service from which the track was fetched
         */
        this.client.emit('fetched', track, query, service);
        return track;
    }

    /**
     * Display the queue
     * @param {discord.Message} msg
     */
    async displayQueue(msg) {
        return (this.queue.length > 0)
            ?
            msg.channel.send(`\`-\` \`${this.queue.map(track => track.title).join("\`\n\`-\` \`")}\``)
            :
            msg.channel.send(`la liste de lecture est vide.`);
    }

    /**
     * Push track to the queue
     * @param {discord.Message} msg
     */
    async addToQueue(msg, track) {
        await this.queue.add(track)
        return msg.reply(`\`${track.title}\` a été ajouté à la liste de lecture.`);
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
