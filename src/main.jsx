import React from 'react';
import ReactDOM from 'react-dom';

import Viewer from './viewer'
import * as config from './config'
import loadImage from './util/load_image'
import VibratorController from './vibrations/hue2'

const maxStrength = 20

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


class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null
        }

        loadStream(0)
            .then(img1 => {
                this.setState({ image: img1 })
            }).catch(x => {
                console.error(x)
            })
        
        if (!config.sepectator) {
            setupWebViewJavascriptBridge(bridge => {
                this._bridge = bridge

                this._vibrator = new VibratorController((strength, cb) => {
                    strength = Math.floor(strength * maxStrength)
                    this._bridge.callHandler('vibrate', { strength }, cb)
                })
            })
        }
    }

    onSampleChanged(rgb) {
        this._vibrator && this._vibrator.onSampleChanged(rgb)
    }

    render() {
        // switch rendering mode
        // normal: shows view with overlay for color
        // color: shows only the current target color
        // black: shows nothing in view
        const mode = 'normal'; // normal, color, black
        return (
            <div className="main">
                <Viewer mode={mode} image={this.state.image} onSampleChanged={this.onSampleChanged.bind(this)} />
                <Viewer mode={mode} image={this.state.image} />
            </div>)
    }
}

ReactDOM.render(
    <Main />,
    document.getElementById('content'));
