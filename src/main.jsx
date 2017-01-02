import React from 'react';
import ReactDOM from 'react-dom';
const tinycolor = require("tinycolor2");

import Viewer from './viewer'
import * as config from './config'
import loadImage from './util/load_image'


const loadStream = (number) =>
    loadImage(`${config.viewerUrl}?action=stream_${number}`)

function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
    if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'https://__bridge_loaded__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function () { document.documentElement.removeChild(WVJBIframe) }, 0)
}

const lowestFrequency = 0.05
const highestFrequency = 1.2

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null
        }

        this._frequency = lowestFrequency
        this._strength = 0
        this._enabled = true

        loadStream(0)
            .then(img1 => {
                this.setState({ image: img1 })
            }).catch(x => {
                console.error(x)
            })

        setupWebViewJavascriptBridge(bridge => {
            this._bridge = bridge
            // Inform webview that we are ready
            bridge.callHandler('ready', {}, (response) => { 
                this.updateVibrations()
            })
        })
    }

    updateVibrations() {
        const time = Date.now()
        
        const period = lowestFrequency + this._frequency * (highestFrequency - lowestFrequency);
        let strength = Math.floor(this._strength * 20) * (this._enabled ? 1 : 0)
        
        console.log(strength, period)
        this._bridge.callHandler('vibrate', { strength }, responseData => {
            const elapsed = (Date.now() - time) / 1000
            setTimeout(() => {
                const afterStartTime = Date.now()
                this._bridge.callHandler('vibrate', { strength: 0 }, responseData => {
                    const elapsed = (Date.now() - afterStartTime) / 1000
                    setTimeout(
                    () => this.updateVibrations(),  Math.max(0, (period - elapsed) * 1000));
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
            this._strength = (hsv.s - 0.3) / 2.0 + (hsv.v - 0.3) / 2.0
            this._enabled = true
        }
        
        const maxHue = 280
        let frequency = hsv.h
        // map red - blue to standard range, but wrap magenta back around
        if (frequency > maxHue) {
            frequency = maxHue - ((frequency - maxHue) / (360 - maxHue)) * maxHue
        }

        this._frequency = 1.0 - frequency / 300
    }

    render() {
        return (
            <div className="main">
                <Viewer image={this.state.image} onSampleChanged={this.onSampleChanged.bind(this)} />
                <Viewer image={this.state.image} />
            </div>)
    }
}

ReactDOM.render(
    <Main />,
    document.getElementById('content'));
