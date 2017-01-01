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

        setupWebViewJavascriptBridge(bridge => {
            this._bridge = bridge
            // Inform webview that we are ready
            bridge.callHandler('ready', {}, (response) => { /* noop */ })

        
        })
    }

    onSampleChanged(rgb) {
        if (!this._bridge || this._updating)
            return;

        const hsl = tinycolor(rgb).toHsl();
        console.log(hsl);
        this._updating  = true

        const s = Math.floor(hsl.s * 20);
        this._bridge.callHandler('vibrate', { 'strength': s }, responseData => {
            this._updating = false
        })
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
