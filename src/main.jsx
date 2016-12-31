import React from 'react';
import ReactDOM from 'react-dom';

import Viewer from './viewer'
import * as config from './config'
import loadImage from './util/load_image'


const loadStream = (number) =>
    loadImage(`${config.viewerUrl}?action=stream_${number}`)


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
    }

    render() {
        return (
            <div className="main">
                <Viewer image={this.state.image} />
                <Viewer image={this.state.image} />
            </div>)
    }
}

ReactDOM.render(
    <Main />,
    document.getElementById('content'));