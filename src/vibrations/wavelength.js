const tinycolor = require("tinycolor2")

const quickestPeriod = 0.05
const slowestPeriod = 1.2

// Since magenta cannot be mapped directly to a wavelength, define a max blue value and wrap everything after back around
const maxHue = 280

/**
 * Maps hue to square wave periods (red slowest, blue quickest) and saturation+value to vibration strength
 */
export default class WavelengthMapper {
    constructor(applyVibration) {
        this._applyVibration = applyVibration

        this._frequency = quickestPeriod
        this._strength = 0

        this.updateVibrations()
    }

    updateVibrations() {
        const period = quickestPeriod + this._frequency * (slowestPeriod - quickestPeriod);

        const startingTime = Date.now()
        this._applyVibration(this._strength, () => {
            const elapsed = (Date.now() - startingTime) / 1000
            setTimeout(() => {
                const afterStartTime = Date.now()
                this._applyVibration(0, () => {
                    const elapsed = (Date.now() - afterStartTime) / 1000
                    setTimeout(() => {
                        this.updateVibrations()
                    }, Math.max(0, (period - elapsed) * 1000))
                })
            }, Math.max(0, (period - elapsed) * 1000))
        })
    }

    onSampleChanged(rgb) {
        const hsv = tinycolor(rgb).toHsv()
        if (hsv.v < 0.3 || hsv.s < 0.3) {
            this._strength = 0
            this._enabled = false
        } else {
            this._strength = (hsv.s - 0.3) / (1.0 - 0.3) / 2.0 + (hsv.v - 0.3) / (1.0 - 0.3) / 2.0
            this._enabled = true
        }

        let frequency = hsv.h
        // map red - blue to standard range, but wrap magenta back around
        if (frequency > maxHue) {
            frequency = maxHue - ((frequency - maxHue) / (360 - maxHue)) * maxHue
        }

        this._frequency = 1.0 - frequency / maxHue
    }
}

