import React from 'react';
import ReactDOM from 'react-dom';

class Indicator extends React.Component {
    render() {
        return (
            <div className='indicator'
                style={{
                    width: '25px',
                    height: '25px',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '100px',
                    border: `4px solid rgba(${this.props.color[0]}, ${this.props.color[1]}, ${this.props.color[2]}, 0.5)` }}/>
        )
    }
}

export default class Viewer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            color: [0, 0, 0]
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
            { weight: 0.4, offset: 1, count: 4 },
            { weight: 0.6, offset: 15, count: 8 }

        ]
        const center = { x: Math.round(this._canvas.width / 2), y: Math.round(this._canvas.height / 2) }
        const sum = [0, 0, 0]
        for (const sampleSet of sampleSets) {
            const weight = sampleSet.weight * (1.0 / sampleSet.count)
            const dAngle = Math.PI * 2.0 / sampleSet.count
            let angle = 0
            for (let i = 0; i < sampleSet.count; ++i, angle += dAngle) {
                const offset = { x: sampleSet.offset * Math.sin(angle), y: sampleSet.offset * Math.cos(angle)}
                const pixel = ctx.getImageData(center.x + offset.x, center.y + offset.y, 1, 1).data;
                sum[0] += weight * pixel[0]
                sum[1] += weight * pixel[1]
                sum[2] += weight * pixel[2]
            }
        }

        this.setState({ color: [Math.floor(sum[0]), Math.floor(sum[1]), Math.floor(sum[2])] })
    }

    render() {
        return (
            <div className="eye">
                <canvas style={{width: '100%', height: '100%'}} ref={canvas => { this._canvas = canvas; }} />
                <Indicator color={this.state.color}/>
            </div>
        )
    }
}
