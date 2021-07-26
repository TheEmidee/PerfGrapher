import React, { Component } from 'react';

export default class CountersInfos extends Component {
    render() {
        return (
            <div>
                <p><b>Git SHA:</b> {this.props.countersInfos.sha}</p>
                <p><b>Triangle Count:</b> {this.props.countersInfos.trianglecount}</p>
                <p><b>FPS:</b> {this.props.countersInfos.fps}</p>
            </div>
        );
    }
}