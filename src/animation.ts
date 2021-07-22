import * as PIXI from "pixi.js"

export interface FrameMarker {
  name: string;
  time: number;
}

/**
 * Represents an animation.
 */
export abstract class Animation extends PIXI.utils.EventEmitter {
  private _ticker?: PIXI.Ticker
  private _update?: (...params: any[]) => void
  private _markers: FrameMarker[]


  /** The duration (in seconds) of this animation. */
  abstract readonly duration: number

  /** The current position (in seconds) of this animation. */
  abstract position: number

  /** The speed that the animation will play at. */
  speed = 1

  /** A value indicating if the animation is looping. */
  loop = false

  /**
   * Creates a new animation with the specified name.
   * @param name Name for the animation.
   */
  constructor(public name?: string, markers: FrameMarker[] = []) {
    super()
    this._markers = markers;
  }

  /**
   * Starts playing the animation using the specified ticker.
   * @param ticker The ticker to use for updating the animation. If a ticker
   * is not given, the shared ticker will be used.
   */
  play(ticker = PIXI.Ticker.shared) {
    this.position = 0
    if (!this._ticker) {
      this._update = () => {
        this.update(ticker.deltaMS / 1000 * this.speed)
      }
      this._ticker = ticker.add(this._update)
    }
  }

  /**
   * Stops playing the animation.
   */
  stop() {
    if (this._ticker && this._update) {
      this._ticker.remove(this._update)
      this._ticker = this._update = undefined
      this.position !== this.duration && this.emit("stopped")
    }
  }

  /**
   * Updates the animation by the specified delta time.
   * @param delta The time in seconds since last frame.
   */
  update(delta: number) {
    const previousPosition = this.position

    this.position += delta

    for (const { name, time } of this._markers) {
      if (previousPosition < time && this.position >= time) {
        this.emit("frameEvent", name);
      }
    }

    if (this.position < this.duration) {
      return
    }

    if (this.loop) {
      if (this.position > this.duration) {
        this.position = this.position % this.duration
      }
    }
    else {
      this.position = this.duration
      this.stop()
    }

    this.emit("complete")
  }
}