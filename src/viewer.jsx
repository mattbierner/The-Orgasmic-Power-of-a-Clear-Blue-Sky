import React from 'react';
import ReactDOM from 'react-dom';

class Indicator extends React.Component {
    render() {
        const color = `rgba(${this.props.color.r}, ${this.props.color.g}, ${this.props.color.b}, 0.5)`

        const lowerStyle = { background: `rgb(${this.props.color.r}, ${this.props.color.g}, ${this.props.color.b})` }
        if (this.props.mode === 'color') {
            lowerStyle.width = '100%'
            lowerStyle.height = '100%'
        }

        return (
            <div>
                <div className='indicator' style={{
                    borderColor: color,
                    color: color,
                    display: this.props.mode === 'black' ? 'none' : 'block'
                }} />
                <div className='lower-indicator' style={lowerStyle} />
            </div>
        )
    }
}

export default class Viewer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            color: { r: 0, g: 0, b: 0 }
        }
    }

    componentDidMount() {
        this._animate()
    }

    componentWillReceiveProps(newProps) {
        if (newProps.image !== this.props.image) {
            this._setImage(newProps.image)
        }
    }

    _setImage(img) {
        this._canvas.width = img.width
        this._canvas.height = img.height
    }

    _animate() {
        requestAnimationFrame(() => this._animate())

        if (!this.props.image || !this._canvas)
            return

        const ctx = this._canvas.getContext('2d')
        ctx.save()
        ctx.translate(this._canvas.width, this._canvas.height)
        ctx.scale(-1, -1)
        ctx.drawImage(this.props.image, 0, 0, this._canvas.width, this._canvas.height)
        ctx.restore()

        this._sampleColor(ctx)
    }

    _sampleColor(ctx) {
        const sampleSets = [
            { weight: 0.4, offset: 2, count: 4 },
            { weight: 0.3, offset: 6, count: 8 },
            { weight: 0.3, offset: 12, count: 16 }
        ]
        
        const center = { x: Math.round(this._canvas.width / 2), y: Math.round(this._canvas.height / 2) }
        const sum = { r: 0, g: 0, b: 0 }
        for (const sampleSet of sampleSets) {
            const weight = sampleSet.weight * (1.0 / sampleSet.count)
            const dAngle = Math.PI * 2.0 / sampleSet.count
            let angle = 0
            for (let i = 0; i < sampleSet.count; ++i, angle += dAngle) {
                const offset = { x: sampleSet.offset * Math.sin(angle), y: sampleSet.offset * Math.cos(angle) }
                const pixel = ctx.getImageData(center.x + offset.x, center.y + offset.y, 1, 1).data;
                sum.r += weight * pixel[0]
                sum.g += weight * pixel[1]
                sum.b += weight * pixel[2]
            }
        }

        const color = { r: Math.floor(sum.r), g: Math.floor(sum.g), b: Math.floor(sum.b) }
        this.setState({ color: color })
        if (this.props.onSampleChanged) {
            this.props.onSampleChanged(color)
        }
    }

    render() {
        return (
            <div className="eye">
                <canvas style={{
                    width: '100%',
                    height: '100%',
                    display: this.props.mode === 'black' ? 'none' : 'block'
                }} ref={canvas => { this._canvas = canvas; }} />
                <Indicator mode={this.props.mode} color={this.state.color} />
            </div>
        )
    }
}
