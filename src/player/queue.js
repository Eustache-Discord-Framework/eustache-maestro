'use strict';

/** Represent the music queue */
class Queue extends Array {
    /** Add a track to the queue */
    add(track) {
        return this.push(track);
    }

    /** Return next track */
    next() {
        return this.shift();
    }

    /** Shuffle this queue - Fisher–Yates shuffle algorithm */
    shuffle() {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this;
    }

    /** Empty the queue */
    empty() {
        this.currentTrack = null;
        return this.splice(0, this.length);
    }

    /**
     * Returns x tracks from the queue
     * @param {Number} x The number of tracks
     */
    get(x) {
        return this.slice(0, x)
    }
}

module.exports = Queue;
