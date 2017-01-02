const tinycolor = require("tinycolor2")

// Since magenta cannot be mapped directly to a wavelength, define a max blue value and wrap everything after back around
const maxHue = 280

/**
 * Maps hue to vibration strength (blue fastest, red slowest)
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

        let frequency = hsv.h
        // map red - blue to standard range, but wrap magenta back around
        if (frequency > maxHue) {
            frequency = maxHue - ((frequency - maxHue) / (360 - maxHue)) * maxHue
        }

        this._frequency = Math.max(frequency / maxHue), 1 / 20);
    }
}

