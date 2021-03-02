'use strict';

/** Represent the music queue */
class Queue extends Array {
    /** Empty the queue */
    empty() {
        return this.splice(0, this.length);
    }

    /** Return next track */
    next() {
        const track = this.shift();
        return track;
    }

    /** Add a track to the queue */
    add(track) {
        return this.push(track);
    }

    /** Shuffle this queue */
    shuffle() {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this;
    }
}

module.exports = Queue;
