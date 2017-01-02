const tinycolor = require("tinycolor2")

const maxHue = 280

const minS = 0.3
const minV = 0.3

/**
 * Maps hue to vibration strength (blue fastest, red slowest) but also filter out whites and blacks
 */
export default class HueMapper {
    constructor(applyVibration) {
        this._applyVibration = applyVibration

        this._frequency = 0

        this.updateVibrations()
    }

    updateVibrations() {
        this._applyVibration(this._frequency, () => {
            this.updateVibrations()
        })
    }

    onSampleChanged(rgb) {
        const hsv = tinycolor(rgb).toHsv()
        if (hsv.s < minS || hsv.v < minV) {
            this._frequency = 0
            return;
        }

        let frequency = hsv.h
        // map red - blue to standard range, but wrap magenta back around
        if (frequency > maxHue) {
            frequency = maxHue - ((frequency - maxHue) / (360 - maxHue)) * maxHue
        }

        this._frequency = Math.max(frequency / maxHue, 1 / 20);
    }
}

