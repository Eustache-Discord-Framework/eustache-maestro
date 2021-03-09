'use strict';

/** Represent the music queue */
class Queue extends Array {
  /**
   * Adds one or more track to the queue
   * @param {Track} track Track to push to queue
   */
  add(track) {
    if (Array.isArray(track)) {
      track.forEach(tr => {
        this.push(tr);
      });
    } else {
      this.push(track)
    }
  }

  /**
   * Returns the next track by shifting the Queue
   * @return {Track}
   */
  next() {
    this.current = this.shift();
    return this.current;
  }

  /**
   * Shuffles this queue ;
   * Using Fisher–Yates shuffle algorithm
   */
  shuffle() {
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this[i], this[j]] = [this[j], this[i]];
    }
  }

  /** Empties the queue */
  empty() {
    this.current = null;
    this.splice(0, this.length);
  }

  /**
   * Returns x tracks from the queue
   * @param {Number} x The exact number of tracks you want
   * @return {Track[]} The exact number of tracks you wanted
   */
  get(x) {
    if (x > this.length) {
      return this;
    }
    return this.slice(0, x);
  }
}

module.exports = Queue;
