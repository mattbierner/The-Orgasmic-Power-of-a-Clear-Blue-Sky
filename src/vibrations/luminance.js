const tinycolor = require("tinycolor2")

/**
 * Maps luminance directly to vibration strength
 */
export default class WavelengthMapper {
    constructor(applyVibration) {
        this._applyVibration = applyVibration

        this._luminance = 0

        this.updateVibrations()
    }

    updateVibrations() {
        this._applyVibration(this._luminance, () => {
            this.updateVibrations()
        })
    }

    onSampleChanged(rgb) {
        this._luminance = tinycolor(rgb).getLuminance()
    }
}

