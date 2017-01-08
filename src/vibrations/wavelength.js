const tinycolor = require("tinycolor2")

const quickestPeriod = 0.05
const slowestPeriod = 1.2

// Since magenta cannot be mapped directly to a wavelength, define a max blue value and wrap everything after back around
const maxHue = 280

const minS = 0.2
const minV = 0.15

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
        if (hsv.v < minV || hsv.s < minS) {
            this._strength = 0
        } else {
            this._strength = (hsv.s - minS) / (1.0 - minS) / 2.0 + (hsv.v - minV) / (1.0 - minV) / 2.0
        }

        let frequency = hsv.h
        // map red - blue to standard range, but wrap magenta back around
        if (frequency > maxHue) {
            frequency = maxHue - ((frequency - maxHue) / (360 - maxHue)) * maxHue
        }

        this._frequency = Math.max(frequency / maxHue, 1 / 20);
    }
}

