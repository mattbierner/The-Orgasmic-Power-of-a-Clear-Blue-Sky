const tinycolor = require("tinycolor2")

const targetHue = 240
const targetRange = 30

const minS = 0.4
const minV = 0.4

/**
 * Activate based on closeness to target hue.
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
        const diff = Math.abs(hsv.h - targetHue)
        this._frequency = (diff < targetRange ? 1 : 0) * (1 - diff / targetRange)
    }
}

