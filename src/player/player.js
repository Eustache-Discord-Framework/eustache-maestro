'use strict';

const { player, baseEmbed } = require('../util');
const Queue = require("./queue");
const Voice = require('./voice');
const ServiceDispatcher = require('./dispatcher');

/** Represent the music player */
class Player {
  /**
   * This instance
   * @static
   * @type {Player}
   */
  static _instance = null;

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
   * This player user interface message
   * @type {discord.Message}
   */
  ui;

  static instance(client) {
    if (this._instance === null) {
      this._instance = new this(client)
    }
    return this._instance;
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
    this.serviceDispatcher = new ServiceDispatcher()
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
    await this.voice.join(channel)
      .then(connection => {
        this.connection = connection;
        this.connection.on('disconnect', () => this.destroy());
        reply.edit(`Connecté au salon \`#${connection.channel.name}\`.`);
      })
      .catch(err => {
        reply.edit(`Connectez-vous à un salon vocal d'abord.`);
      });
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
  play(msg, channel, query) {
    if (!query) return
    this.serviceDispatcher.handleQuery(query)
      .then(async tracks => {
        this.addToQueue(msg, tracks);
        await this.connect(msg, channel);
        if (
          this.status !== player.PLAYING
          ||
          this.status === player.OFF
        ) {
          this.next(msg)
        };
      })
      .catch(err => {
        console.error(err);
        msg.reply('média introuvable.')
      });
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
      this.queue.next();
      this.displayQueue(msg);
      return this.stream(msg, this.queue.current);
    };
    msg.channel.send(`la liste de lecture est vide.`);
    this.disconnect(msg);
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
    msg.reply(`le lecteur est été mis en pause.`);
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
    msg.reply(`le lecteur a redémarré.`);
  }

  /**
   * Stop the player
   * @param {discord.Message} msg
   */
  stop(msg) {
    this.emptyQueue(msg);
    if (this.status === player.PLAYING || this.status === player.PAUSED) {
      this.disconnect(msg);
    }
  }

  /**
   * Display the queue
   * @param {discord.Message} msg
   */
  async displayQueue(msg, maxTracks = 12) {
    // Delete the old message
    if (this.ui && this.ui.deletable) this.ui.delete();

    let embed;
    if (this.queue.length === 0 && !this.queue.current) {
      embed = baseEmbed()
        .setTitle('Player - Liste de lecture')
        .setDescription('La liste de lecture est vide.');
    } else {
      embed = baseEmbed()
        .setTitle('Player - Liste de lecture')
        .addField('En ce moment', `\`${this.queue.current.title}\``);

      if (this.queue.length > 0) {
        const count = (this.queue.length > maxTracks) ? maxTracks : this.queue.length;
        const queue = this.queue.get(count).map(track => `\`- ${track.title}\``);
        embed.addField(`${count > 1 ? 'Les ' : 'Le'}${count > 1 ? count : ''} titre${count > 1 ? 's' : ''} à venir`, queue.join('\n'));
      }
    }

    // Send the new message
    this.ui = await msg.channel.send(embed).catch(console.error);
  }

  /**
   * Push track to the queue
   * @param {discord.Message} msg
   * @param {Track|Track[]} track
   */
  async addToQueue(msg, track) {
    if (!track) return msg.reply(`Aucun média n'a été trouvé`);
    this.queue.add(track);
    if (Array.isArray(track) && track.length > 1) {
      msg.reply(`${track.length} médias ajoutés à la liste de lecture.`);
    } else {
      msg.reply(`média ajouté à la liste de lecture.`);
    }
  }

  /**
   * Empty the queue
   * @param {discord.Message} msg
   */
  emptyQueue(msg) {
    this.queue.empty();
    msg.reply(`la liste de lecture a été supprimée.`);
  }

  /**
   * Shuffle the queue
   * @param {discord.Message} msg
   */
  shuffleQueue(msg) {
    this.queue.shuffle()
    msg.reply(`la liste de lecture a été mélangée.`);
  }
}

module.exports = Player;
